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
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;

class UsersController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $users = Users::all();

        return response()->json($users);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'email' => 'required|email',
            'contact_number' => 'required',
            'password' => 'required',
            'department' => 'required',
            'position' => 'required',
            'call_time' => 'required',
            'contract_type' => 'required|in:Probationary,Regular',
            'date_of_birth' => 'required|date',
            'gender' => 'required',
            'nationality' => 'required',
            'address' => 'required',
            'image' => 'nullable|image|max:2048',

            'monthly_salary' => 'required',
            'working_hours_per_day' => 'required',
            'working_days_per_month' => 'required'
        ]);
        $imagePath = $request->hasFile('image') ? $request->file('image')->store('avatars', 'public') : null;
        
        $users = Users::create([
            'name' => $request->name,
            'email' => $request->email,
            'contact_number' => $request->contact_number,
            'password' => Hash::make($request->password),
            'department' => $request->department,
            'position' => $request->position,
            'call_time' => $request->call_time,
            'contract_type' => $request->contract_type,
            'date_of_birth' => $request->date_of_birth,
            'gender' => $request->gender,
            'nationality' => $request->nationality,
            'address' => $request->address,
            'image_path' => $imagePath
        ]);

        Salary::create([
            'user_id' => $users->id,
            'salary_basis' => $request->monthly_salary,
            'working_hours_per_day' => $request->working_hours_per_day,
            'working_days_per_month' => $request->working_days_per_month
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
       

        AuditLog::record('admin', 'employee_created', 'success', $users->name);
        return response()->json($users, 201);
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

        $request->validate([
            'image' => 'nullable|image|max:2048',
        ]);

        $data = $request->except(['image', '_method']);

        if ($request->hasFile('image')) {
            if ($users->image_path) {
                \Storage::disk('public')->delete($users->image_path);
            }
            $data['image_path'] = $request->file('image')->store('avatars', 'public');
        }
        
        AuditLog::record('admin', 'profile_updated', 'success', "{$users->name}: changed " . implode(', ', array_keys($data)));
        $users->update($data);
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
            'date_of_birth' => $user->date_of_birth,
            'gender' => $user->gender,
            'nationality' => $user->nationality,
            'address' => $user->address,
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
        $users = Users::with(['salary', 'leaveBalance', 'attendance.location', 'leaveApplication.user.leaveBalance'])->find($userId);
        if (!$users) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $startOfMonth = Carbon::now()->startOfMonth();
        $today = Carbon::now();
        $absentDays = 0;

        foreach ($startOfMonth->daysUntil($today) as $date) {
            if ($date->dayOfWeek === Carbon::SATURDAY) continue;

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
        /*
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
        */

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
}
