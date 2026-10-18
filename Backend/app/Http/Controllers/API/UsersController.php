<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Users;
use Illuminate\Support\Facades\Hash;
use App\Models\LeaveBalance;
use App\Models\Salary;
use App\Models\Holiday;
use App\Models\Attendance;
use App\Models\LeaveApplication;
use App\Models\AuditLog;
use App\Models\FamilyMember;
use App\Service\SendEmail;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use App\Rules\StrongPassword;

class UsersController extends Controller
{
    // The numbers government forms ask for: field => [name shown in messages, example].
    // All optional; the format comes from Users::GOV_ID_GROUPS.
    private const GOV_IDS = [
        'tin'               => ['TIN', '123-456-789-000'],
        'sss_number'        => ['SSS number', '12-3456789-0'],
        'philhealth_number' => ['PhilHealth number', '12-345678901-2'],
        'pagibig_number'    => ['Pag-IBIG number', '1234-5678-9012'],
    ];

    /** Writes each number the same way (123456789 -> 123-456-789) before it is checked and saved. */
    private function normalizeGovIds(Request $request): void
    {
        foreach (array_keys(self::GOV_IDS) as $field) {
            if ($request->has($field)) {
                $request->merge([$field => Users::formatGovId($field, $request->input($field))]);
            }
        }
    }

    /** Validation rules for the four numbers; [$rules, $messages]. $ignoreId = the employee being edited. */
    private function govIdValidation($ignoreId = null): array
    {
        $rules = [];
        $messages = [];
        foreach (self::GOV_IDS as $field => [$label, $example]) {
            $rules[$field] = [
                'nullable',
                'regex:' . Users::govIdRegex($field),
                Rule::unique('users', $field)->ignore($ignoreId),
            ];
            $messages["$field.regex"] = "Enter a valid $label, for example $example.";
            $messages["$field.unique"] = "This $label already belongs to another employee.";
        }
        return [$rules, $messages];
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $users = Users::all();

        return response()->json($users);
    }

    /**
     * The spouse and children sent by the forms: a JSON list in the "family" field, for example
     * [{"relationship":"Spouse","name":"Ana Cruz","birthday":"1990-03-04"}, ...].
     * Returns [rows, null] when it is fine, [null, "message"] when something is wrong, and
     * [null, null] when the request does not carry a family list at all (leave it as it is).
     * An empty list [] means "no family members".
     */
    private function parseFamily(Request $request): array
    {
        if (!$request->has('family')) {
            return [null, null];
        }
        $raw = $request->input('family');
        $list = is_array($raw) ? $raw : ($raw === null || $raw === '' ? [] : json_decode((string) $raw, true));
        if (!is_array($list)) {
            return [null, 'The family list is not valid.'];
        }
        if (count($list) > 20) {
            return [null, 'At most 20 family members can be added.'];
        }

        $rows = [];
        $spouses = 0;
        foreach (array_values($list) as $i => $member) {
            $n = $i + 1;
            $relationship = $member['relationship'] ?? '';
            $name = trim((string) ($member['name'] ?? ''));
            $birthday = $member['birthday'] ?? null;
            $birthday = ($birthday === '' || $birthday === null) ? null : (string) $birthday;

            if (!in_array($relationship, ['Spouse', 'Child'], true)) {
                return [null, "Family member {$n}: choose Spouse or Child."];
            }
            if ($name === '') {
                return [null, "Family member {$n}: enter a name."];
            }
            if (mb_strlen($name) > 100) {
                return [null, "Family member {$n}: the name is too long."];
            }
            if ($birthday !== null) {
                $date = \DateTime::createFromFormat('!Y-m-d', $birthday);
                if (!$date || $date->format('Y-m-d') !== $birthday) {
                    return [null, "Family member {$n}: the birthday is not a valid date."];
                }
                if ($date > new \DateTime('today')) {
                    return [null, "Family member {$n}: the birthday cannot be in the future."];
                }
            }
            if ($relationship === 'Spouse') {
                $spouses++;
            }
            $rows[] = ['relationship' => $relationship, 'name' => $name, 'birthday' => $birthday];
        }
        if ($spouses > 1) {
            return [null, 'Only one spouse can be added.'];
        }

        return [$rows, null];
    }

    /** Replaces the employee's family list with these rows (checked by parseFamily). */
    private function saveFamily(Users $user, array $rows): void
    {
        DB::transaction(function () use ($user, $rows) {
            $user->familyMembers()->delete();
            foreach ($rows as $row) {
                FamilyMember::create($row + ['user_id' => $user->id]);
            }
        });
    }

    private const BIRTH_DATE_MESSAGE = ['date_of_birth.before_or_equal' => 'Employee must be at least 18 years old.'];

    /** The latest date of birth an employee may have: today minus 18 years, worked out on every request (Asia/Manila). */
    private function latestBirthDate(): string
    {
        // no overflow: 29 Feb minus 18 years is 28 Feb, never 1 Mar, so nobody a day short of 18 gets in
        return now()->subYearsNoOverflow(18)->toDateString();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $this->normalizeGovIds($request);
        [$govRules, $govMessages] = $this->govIdValidation();

        $request->validate([
            'name' => 'required',
            'email' => 'required|email',
            'contact_number' => 'required',
            'department' => 'required',
            'position' => 'required',
            'call_time' => 'required',
            'contract_type' => 'required|in:Probationary,Regular',
            'employment_status' => 'required|in:Contractual,Permanent',
            'date_of_birth' => ['required', 'date', 'before_or_equal:' . $this->latestBirthDate()],
            'gender' => 'required',
            'nationality' => 'required',
            'address' => 'required',
            'image' => 'nullable|image|max:2048',

            'monthly_salary' => 'required',
            'working_hours_per_day' => 'required',
            // 'working_days_per_month' => 'required|numeric|min:1|max:31'
        ] + $govRules, $govMessages + self::BIRTH_DATE_MESSAGE);

        // spouse and children (shown on the profile only); checked before anything is saved
        [$family, $familyError] = $this->parseFamily($request);
        if ($familyError) {
            return response()->json(['message' => $familyError, 'errors' => ['family' => [$familyError]]], 422);
        }

        $imagePath = $request->hasFile('image') ? $request->file('image')->store('avatars', 'public') : null;

        // HR does not choose the password: a random one is made here and emailed to the employee
        $password = StrongPassword::generate();

        $users = Users::create([
            'name' => $request->name,
            'email' => $request->email,
            'contact_number' => $request->contact_number,
            'password' => Hash::make($password),
            'department' => $request->department,
            'position' => $request->position,
            'call_time' => $request->call_time,
            'contract_type' => $request->contract_type,
            'employment_status' => $request->employment_status,
            'date_of_birth' => $request->date_of_birth,
            'gender' => $request->gender,
            'nationality' => $request->nationality,
            'tin' => $request->tin,
            'sss_number' => $request->sss_number,
            'philhealth_number' => $request->philhealth_number,
            'pagibig_number' => $request->pagibig_number,
            'address' => $request->address,
            'image_path' => $imagePath,
        ]);

        if ($family) {
            $this->saveFamily($users, $family);
        }
        
        Salary::create([
            'user_id' => $users->id,
            'salary_basis' => $request->monthly_salary,
            'working_hours_per_day' => 8,
            'working_days_per_month' => 26
        ]);
        //Create a Balance
        if($users->contract_type == "Regular"){
            LeaveBalance::create([
                'user_id' => $users->id,
                'sick' => 2,
                'vacation' => 2,
                'emergency' => 2,
                'birthday' => 1,
                'solo_parent' => 7,
                'paternity' => 7,
                'maternity' => 120,
            ]);
        } else {
            // not Regular yet (Probationary): the row exists, with no credits
            LeaveBalance::create([
                'user_id' => $users->id,
                'sick' => 0,
                'vacation' => 0,
                'emergency' => 0,
                'birthday' => 0,
                'solo_parent' => 0,
                'paternity' => 0,
                'maternity' => 0,
            ]);
        }
       
        
        $emailSent = (new SendEmail())->send($users, $password);
        AuditLog::record('admin', 'employee_created', 'success', $users->name);
        // the password goes to the employee by email; only when that fails is it shown to HR (once),
        // so the employee is not locked out
        return response()->json($users->toArray() + [
            'email_sent' => $emailSent,
            'temporary_password' => $emailSent ? null : $password,
        ], 201);
        
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $users = Users::find($id);
        if (!$users) {
            return response()->json(['message' => 'User not found'], 404);
        }
        else {
            return response()->json($users);
        }

    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $users = Users::find($id);
        if (!$users) {
            return response()->json(['message' => 'User not found'], 404);
        }

        // the edit form sends every field; an empty number is saved as empty, a filled one is checked
        $this->normalizeGovIds($request);
        [$govRules, $govMessages] = $this->govIdValidation($users->id);

        $request->validate([
            'image' => 'nullable|image|max:2048',
            // the edit form sends it every time; older accounts may still have none
            'employment_status' => 'sometimes|nullable|in:Contractual,Permanent',
            // the edit form sends it every time; an employee must be at least 18
            'date_of_birth' => ['sometimes', 'required', 'date', 'before_or_equal:' . $this->latestBirthDate()],
        ] + $govRules, $govMessages + self::BIRTH_DATE_MESSAGE);

        // the whole family list is replaced when the form sends one; left alone when it does not
        [$family, $familyError] = $this->parseFamily($request);
        if ($familyError) {
            return response()->json(['message' => $familyError, 'errors' => ['family' => [$familyError]]], 422);
        }

        $data = $request->except(['image', '_method', 'family']);

        if ($request->hasFile('image')) {
            if ($users->image_path) {
                \Storage::disk('public')->delete($users->image_path);
            }
            $data['image_path'] = $request->file('image')->store('avatars', 'public');
        }
        
        // the log names the fields that changed, never their values
        $changed = array_keys($data);
        if ($family !== null) {
            $changed[] = 'family';
        }
        AuditLog::record('admin', 'profile_updated', 'success', "{$users->name}: changed " . implode(', ', $changed));
        $users->update($data);
        if ($family !== null) {
            $this->saveFamily($users, $family);
        }
        return response()->json($users);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $users = Users::find($id);
        if (!$users) {
            return response()->json(['message' => 'User not found'], 404);
        }
        else {
            AuditLog::record('admin', 'employee_deleted', 'success', $users->name);
            $users->delete();
            return response()->json(['message' => 'User deleted successfully']);
        }
    }
    public function userProfileDetails(){
        $userId = $this->getUserIdFromToken();

        $user = Users::where('id', $userId)->first();

        // the newest successful login is this session's own, so the one before it is the "last login"
        $lastLogin = AuditLog::where('user_id', $userId)
            ->where('category', 'login')
            ->where('status', 'success')
            ->orderByDesc('id')
            ->skip(1)
            ->first();

        return response()->json([
            'is_active' => (bool) $user->is_active,
            'last_login' => $lastLogin?->created_at,
            'name' => $user->name,
            // e.g. "avatars/xxxx.png" (or null); the phone loads it from GET /api/avatars/{file} with its token
            'image_path' => $user->image_path,
            'email' => $user->email,
            'contact' => $user->contact_number,
            'department' => $user->department,
            'position' => $user->position,
            'employment_status' => $user->employment_status,
            'date_of_birth' => $user->date_of_birth,
            'gender' => $user->gender,
            'nationality' => $user->nationality,
            'tin' => $user->tin,
            'sss_number' => $user->sss_number,
            'philhealth_number' => $user->philhealth_number,
            'pagibig_number' => $user->pagibig_number,
            'address' => $user->address,
            'family' => $user->familyMembers->map(fn ($m) => [
                'relationship' => $m->relationship,
                'name' => $m->name,
                'birthday' => $m->birthday,
            ])->values(),
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at
        ]);
    }
    /**
     * The employee edits their own contact number, address and photo (the phone's Edit Profile).
     * Only these three fields are accepted, so name, department, salary etc. stay HR-only.
     */
    public function updateMyProfile(Request $request)
    {
        $user = Users::find($this->getUserIdFromToken());
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $request->validate([
            'contact_number' => ['sometimes', 'required', 'regex:/^[0-9+\-\s()]{7,20}$/'],
            'address'        => 'sometimes|required|string|max:255',
            'image'          => 'nullable|image|max:2048',
        ], [
            'contact_number.regex' => 'Enter a valid phone number.',
        ]);

        $changed = [];
        if ($request->has('contact_number') && $request->contact_number !== $user->contact_number) {
            $user->contact_number = $request->contact_number;
            $changed[] = 'contact number';
        }
        if ($request->has('address') && $request->address !== $user->address) {
            $user->address = $request->address;
            $changed[] = 'address';
        }
        if ($request->hasFile('image')) {
            if ($user->image_path) {
                Storage::disk('public')->delete($user->image_path);
            }
            $user->image_path = $request->file('image')->store('avatars', 'public');
            $changed[] = 'photo';
        }

        if ($changed) {
            $user->save();
            AuditLog::record('employee', 'profile_updated', 'success', "{$user->name}: changed " . implode(', ', $changed), $user->id, $user->email);
        }

        return response()->json([
            'message'    => $changed ? 'Profile updated' : 'Nothing to change',
            'contact'    => $user->contact_number,
            'address'    => $user->address,
            'image_path' => $user->image_path,
        ]);
    }
    public function byUser(string $userId)
    {
        $users = Users::with(['salary', 'leaveBalance', 'familyMembers', 'attendance.location', 'leaveApplication.user.leaveBalance'])->find($userId);
        if (!$users) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $startOfMonth = Carbon::now()->startOfMonth();
        $today = Carbon::now();
        $absentDays = 0;

        foreach ($startOfMonth->daysUntil($today) as $date) {
            if ($date->isWeekend()) continue;   // Saturday and Sunday are not workdays, so nobody is absent on them

            $isHoliday = Holiday::where('date', $date->toDateString())->exists();
            if ($isHoliday) continue;

            $hasAttendance = Attendance::where('user_id', $userId)->whereDate('date', $date)->exists();
            if ($hasAttendance) continue;

            $onLeave = LeaveApplication::where('user_id', $userId)
                ->where('status', 'approved')
                ->whereDate('start_date', '<=', $date)
                ->whereDate('end_date', '>=', $date)
                ->exists();
            if ($onLeave) continue;

            $absentDays++;
        }
        $onTimeCount = Attendance::where('user_id', $userId)
            ->where('status', 'On-Time')
            ->whereDate('date', '>=', $startOfMonth)
            ->count();

        $lateCount = Attendance::where('user_id', $userId)
            ->where('status', 'Late')
            ->whereDate('date', '>=', $startOfMonth)
            ->count();
        $users->absent = $absentDays;
        $users->on_time = $onTimeCount;
        $users->late = $lateCount;

        // overtime Comment
        
        $service = new \App\Service\SalaryService();
        $salary = $users->salary;
        $users->overtime_hours = 0;
        $users->overtime_pay = 0;
        if ($salary) {
            $hrs = $service->overtimeHours(
                $users->id,
                $salary->working_hours_per_day,
                Carbon::now()->startOfMonth()->toDateString(),
                Carbon::now()->endOfMonth()->toDateString()
            );
            $hourly = $service->hourlyRate(
                $service->dailyWage($salary->salary_basis, $salary->working_days_per_month),
                $salary->working_hours_per_day
            );
            $users->overtime_hours = $hrs;
            $users->overtime_pay = $service->overtimePay($hourly, $hrs, 'regular');
        }
        

        return response()->json($users);
    }
    public function avatar(string $filename)
    {
        $path = 'avatars/' . basename($filename);
        if (! Storage::disk('public')->exists($path)) {
            abort(404);
        }
        return Storage::disk('public')->response($path);
    }
    public function setActive(Request $request, string $id)
    {
        $request->validate(['is_active' => 'required|boolean']);
        $user = Users::find($id);
        if (!$user) return response()->json(['message' => 'User not found'], 404);

        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'You cannot deactivate your own account.'], 422);
        }

        $user->is_active = $request->boolean('is_active');
        $user->save();

        if (!$user->is_active) {
            $user->tokens()->delete();   // log them out of the phone right away
        }

        AuditLog::record('admin', $user->is_active ? 'employee_reactivated' : 'employee_deactivated', 'success', $user->name);
        return response()->json($user);
    }

    /**
     * HR resets an employee's forgotten password: a new random password is made, the old one stops
     * working at once (every phone and browser is logged out), and the new one is emailed to the employee.
     * Only when the email fails is the password shown to HR (once), so the employee is not locked out.
     */
    public function resetPassword(Request $request, string $id)
    {
        $user = Users::find($id);
        if (!$user) return response()->json(['message' => 'User not found'], 404);

        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'You cannot reset your own password here.'], 422);
        }

        $password = StrongPassword::generate();
        $user->password = $password;   // the model hashes it
        $user->save();
        $user->tokens()->delete();     // log them out everywhere: the old password and any open session are finished

        AuditLog::record('admin', 'password_reset', 'success', $user->name);
        $emailSent = (new SendEmail())->sendReset($user, $password);

        return response()->json([
            'message' => $emailSent ? 'The new password was emailed to the employee.' : 'The password was reset, but the email could not be sent.',
            'email_sent' => $emailSent,
            'temporary_password' => $emailSent ? null : $password,
        ]);
    }
}
