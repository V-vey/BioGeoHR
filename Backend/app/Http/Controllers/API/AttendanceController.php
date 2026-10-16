<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Attendance;
use App\Models\Users;
use App\Models\Location;
use App\Models\LeaveApplication;
use App\Models\Holiday;
use App\Models\SystemSetting;
use App\Models\AuditLog;
use App\Http\Controllers\Feature\AttendanceService;
use App\Service\AbsenceService;
use Carbon\Carbon;
use Laravel\Sanctum\PersonalAccessToken; 
class AttendanceController extends Controller
{
    // //For the Service Callback
    // public function __construct(AttendanceService $attendance)
    // {
    //     $this->attendance = $attendance;

    // }
    /**
     * Display a listing of the resource.
     */
    // The rules for the filters that both index() and export() accept.
    private const LIST_FILTERS = [
        'search'     => 'sometimes|nullable|string|max:100',
        'status'     => 'sometimes|nullable|in:On-Time,Late,Absent',
        'department' => 'sometimes|nullable|string|max:100',
        'date_from'  => 'sometimes|nullable|date',
        'date_to'    => 'sometimes|nullable|date',
    ];

    // Attendance joined with the employee and the place, filtered and newest first.
    // Joins (not relations) so the name search and the department filter run in the database.
    private function filteredAttendance(Request $request)
    {
        $query = Attendance::query()
            ->leftJoin('users', 'users.id', '=', 'attendances.user_id')
            ->leftJoin('locations', 'locations.id', '=', 'attendances.location_id')
            ->select(
                'attendances.date', 'attendances.status', 'attendances.time_in', 'attendances.time_out',
                'users.name as u_name', 'users.department as u_department',
                'users.position as u_position', 'users.contract_type as u_contract',
                'locations.name as l_name'
            )
            // hours of the day all sessions added up and how many in/out pairs it has
            ->selectRaw(Attendance::workedSecondsSql() . ' as worked_secs')
            ->selectRaw(Attendance::sessionCountSql() . ' as sessions_count');

        if ($term = trim((string) $request->input('search'))) {
            // % and _ typed by the user must not act as wildcards
            $query->where('users.name', 'like', '%' . addcslashes($term, '%_\\') . '%');
        }
        if ($request->filled('status')) {
            $query->where('attendances.status', $request->input('status'));
        }
        if ($request->filled('department')) {
            $query->where('users.department', $request->input('department'));
        }
        if ($request->filled('date_from')) {
            $query->where('attendances.date', '>=', Carbon::parse($request->input('date_from'))->toDateString());
        }
        if ($request->filled('date_to')) {
            $query->where('attendances.date', '<=', Carbon::parse($request->input('date_to'))->toDateString());
        }

        return $query->orderByDesc('attendances.date')->orderByDesc('attendances.id');
    }

    // one row, in the shape the web pages already use
    private function attendanceRow($a): array
    {
        return [
            'date' => $a->date,
            'location' => $a->l_name ?? 'Unknown Location',
            'name' => $a->u_name,
            'department' => $a->u_department,
            'position' => $a->u_position,
            'contractType' => $a->u_contract,
            'status' => $a->status,
            'clockIn' => $a->time_in,
            'clockOut' => $a->time_out,
            'workedSeconds' => (int) $a->worked_secs,
            'sessions' => (int) $a->sessions_count,
        ];
    }

    public function index(Request $request)
    {
        $request->validate(self::LIST_FILTERS + [
            'page'     => 'sometimes|integer|min:1',
            'per_page' => 'sometimes|integer|min:1|max:100',
        ]);

        $page = $this->filteredAttendance($request)->paginate($request->integer('per_page', 16));

        return response()->json([
            'data'         => $page->getCollection()->map(fn ($a) => $this->attendanceRow($a))->values(),
            'current_page' => $page->currentPage(),
            'last_page'    => $page->lastPage(),
            'per_page'     => $page->perPage(),
            'total'        => $page->total(),
            'departments'  => Users::whereNotNull('department')->distinct()->orderBy('department')->pluck('department'),
        ]);
    }


    public function export(Request $request)
    {
        $request->validate(self::LIST_FILTERS);

        $query = $this->filteredAttendance($request);
        $limit = 20000;
        if ((clone $query)->toBase()->getCountForPagination() > $limit) {
            return response()->json(['message' => "More than {$limit} records match. Choose a shorter date range."], 422);
        }

        return response()->json($query->get()->map(fn ($a) => $this->attendanceRow($a))->values());
    }

    //manual attendance
    public function store(Request $request)
    {
        $data = $request->validate([
            'user_id'     => 'required|exists:users,id',
            'date'        => 'required|date|before_or_equal:today',
            'status'      => 'required|in:On-Time,Late,Absent',
            'location_id' => 'required_unless:status,Absent|nullable|exists:locations,id',
            'time_in'     => 'required_unless:status,Absent|nullable|date_format:H:i',
            'time_out'    => 'nullable|date_format:H:i|after:time_in',
            'remarks'     => 'required|string|max:255',
        ]);

        if (Carbon::parse($data['date'])->isSunday()) {
            return response()->json(['message' => 'Sunday is a non-working day.'], 422);
        }
        if (Carbon::parse($data['date'])->isSaturday()) {
            return response()->json(['message' => 'Saturday is a non-working day.'], 422);
        }

        $absent = $data['status'] === 'Absent';

        $attendance = Attendance::updateOrCreate(
            ['user_id' => $data['user_id'], 'date' => $data['date']],
            [
                'status'      => $data['status'],
                'location_id' => $absent ? null : $data['location_id'],
                'time_in'     => $absent ? null : $data['time_in'],
                'time_out'    => $absent ? null : ($data['time_out'] ?? null),
                'remarks'     => $data['remarks'],
            ]
        );
        AuditLog::record('admin', 'manual_attendance', 'success', "User {$data['user_id']}, {$data['date']}, {$data['status']}. Reason: {$data['remarks']}");
        return response()->json($attendance, $attendance->wasRecentlyCreated ? 201 : 200);
    }
    /**
     * Display the specified resource.
     */
    public function show(Request $request)
    {
        $userId = $this->getUserIdFromToken();
        // worked_secs: the day's hours with every session added up (the time between sessions is not counted)
        $query = Attendance::with('location')->where('user_id', $userId)
            ->select('attendances.*')
            ->selectRaw(Attendance::workedSecondsSql() . ' as worked_secs');

        // ?date=2026-10-12 : only that day (the phone's date filter)
        $request->validate(['date' => 'sometimes|nullable|date_format:Y-m-d']);
        if ($request->filled('date')) {
            $query->whereDate('attendances.date', $request->input('date'));
        }

        $row = function ($attendance) {
            return [
                'location'  => $attendance->location ? $attendance->location->name : 'Unknown Location',
                'date'      => $attendance->date,
                'status'    => $attendance->status,
                'clock_in'  => $attendance->time_in,
                'clock_out' => $attendance->time_out,
                'worked_seconds' => (int) $attendance->worked_secs,
            ];
        };

        // The phone asks for one page at a time (newest first), so a long history is never sent whole.
        // Without "page" the answer is the whole list, as it always was.
        if ($request->has('page')) {
            $request->validate([
                'page'     => 'integer|min:1',
                'per_page' => 'sometimes|integer|min:1|max:50',
            ]);
            $page = $query->orderByDesc('date')->orderByDesc('id')
                ->paginate((int) $request->input('per_page', 7));

            return response()->json([
                'data'         => $page->getCollection()->map($row)->values(),
                'current_page' => $page->currentPage(),
                'last_page'    => $page->lastPage(),
                'total'        => $page->total(),
            ]);
        }

        return response()->json($query->get()->map($row));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request)
    {
        $userId = $this->getUserIdFromToken();
        $attendance = Attendance::find($userId);
            
        if (!$attendance) {
            return response()->json(['message' => 'Attendance record not found'], 404);
        }
        else{
            $attendance->update($request->all());
            return response()->json($attendance);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy()
    {
        $userId = $this->getUserIdFromToken();
        $attendance = Attendance::find($userId);

        if (!$attendance) {
            return response()->json(['message' => 'Attendance record not found'], 404);
        }
        else{
            $attendance->delete();
            return response()->json(['message' => 'Attendance record deleted successfully']);
        }
    }


    /*
        LATE COUNT FUNCTION
    */
    public function countLate(){
        $userId = $this->getUserIdFromToken();

        // $attendance = Attendance::where("user_id", $userId)->get();
        $late = Attendance::where("user_id", $userId)
        ->whereMonth('date', Carbon::now()->month)
        ->whereYear('date', Carbon::now()->year)
        ->where("status", "Late")
        ->count();
        return response()->json(['message' => $late]);
    }
    /*
        On Time COUNT FUNCTION
    */
    public function countOnTime(){
        $userId = $this->getUserIdFromToken();

        // $attendance = Attendance::where("user_id", $userId)->get();
        // this month only, the same as countLate (the phone shows both as "monthly")
        $late = Attendance::where("user_id", $userId)
        ->whereMonth('date', Carbon::now()->month)
        ->whereYear('date', Carbon::now()->year)
        ->where("status", "On-Time")->count();
        return response()->json(['message' => $late]);
    }
    /*
        Absent COUNT FUNCTION (this month; the Absent rows come from the absence sync / manual entry)
    */
    public function countAbsent(){
        $userId = $this->getUserIdFromToken();

        $absent = Attendance::where("user_id", $userId)
        ->whereMonth('date', Carbon::now()->month)
        ->whereYear('date', Carbon::now()->year)
        ->where("status", "Absent")->count();
        return response()->json(['message' => $absent]);
    }

    /*
        RECENT ATTENDANCE FUNCTION
    */
    public function recentAttendance(){
        $userId = $this->getUserIdFromToken();

        $recent = Attendance::where("user_id", $userId)
            ->whereNotNull("time_in")
            ->whereNotNull("time_out")
            ->orderByDesc('date')
            ->orderByDesc('id')
            ->first();

        // nobody has finished a day yet: a normal "empty" answer, not a crash
        if (!$recent) {
            return response()->json(['message' => 'No attendance yet'], 404);
        }

        $location = Location::where('id', $recent->location_id)->first();
        // $timeIn = $recent->time_in->format('g:iA');
        // $timeOut = $recent->time_out->format('g:iA');
        return response()->json([
            'location' => $location?->name ?? 'Unknown Location',
            'date' => $recent->date,
            'status' => $recent->status,
            'clock_in' => $recent->time_in,
            'clock_out' => $recent->time_out,
            'worked_seconds' => (int) Attendance::whereKey($recent->id)
                ->selectRaw(Attendance::workedSecondsSql() . ' as secs')->value('secs'),
        ]);
    }

    /*
        Clock Out Function
    */
    public function clockOut(Request $request){

        $userId = $this->getUserIdFromToken();

        //find the attendance
        $attendance = Attendance::where("user_id", $userId)->latest()->first();

        $date = now('Asia/Manila')->toDateString();

        if (!$attendance || $attendance->date != $date) {
            return response()->json(['message' => 'You have not clocked in today'], 404);
        }
        if ($attendance->time_out !== null) {
            return response()->json(['message' => 'You have already clocked out'], 409);
        }
        
        $time = now()->setTimezone('Asia/Manila')->format('H:i:s');
        DB::transaction(function () use ($attendance, $time) {
            $attendance->ensureFirstSession();
            // close the session that is running (the day's clock-out is the latest one)
            $attendance->sessions()->whereNull('time_out')->latest('id')->first()?->update(['time_out' => $time]);
            $attendance->update(['time_out' => $time]);
        });
        AuditLog::record('check_in', 'clock_out', 'success', "Clocked out at {$time}");
        return $attendance->fresh();
    }

    /**
     * Today's attendance for the clock on the phone, so it can pick up where it left off
     * after the app was closed or restarted. 404 when the employee has not clocked in today.
     */
    public function today()
    {
        $userId = $this->getUserIdFromToken();
        $now = now('Asia/Manila');

        $attendance = Attendance::where('user_id', $userId)
            ->whereDate('date', $now->toDateString())
            ->whereNotNull('time_in')
            ->orderByDesc('id')
            ->first();

        if (!$attendance) {
            return response()->json(['message' => 'Not clocked in today'], 404);
        }

        $running = $attendance->time_out === null;
        $elapsed = 0;
        if ($running) {
            // the session that is running now (a day may have several); the day's first clock-in
            // when it has no sessions. Measured here on the server, so a wrong phone clock or
            // timezone cannot skew the timer.
            $open = $attendance->sessions()->whereNull('time_out')->latest('id')->first();
            $started = Carbon::parse($now->toDateString() . ' ' . ($open?->time_in ?? $attendance->time_in), 'Asia/Manila');
            $elapsed = max(0, $started->diffInSeconds($now, false));
        }

        // everything worked today: the finished sessions plus the one running now
        $finished = (int) Attendance::whereKey($attendance->id)
            ->selectRaw(Attendance::workedSecondsSql() . ' as secs')->value('secs');

        return response()->json([
            'status'          => $attendance->status,
            'time_in'         => $attendance->time_in,
            'time_out'        => $attendance->time_out,
            'running'         => $running,
            'elapsed_seconds' => (int) $elapsed,      // this session only: what the phone's timer shows
            'worked_seconds'  => $finished + (int) $elapsed, // the whole day so far
            'sessions'        => max(1, $attendance->sessions()->count()),
        ]);
    }

    private function isLate($userCallTime, $timeIn){
        $graceMinutes = SystemSetting::first()->late_grace_period_minutes;
        $graceDeadline = Carbon::parse($userCallTime)->addMinutes($graceMinutes)->format('H:i:s');

        if ($timeIn <= $graceDeadline) {
            return "On-Time";
        }
        return "Late";
    }

    public function createAttendance(Request $request){

        $userId = $this->getUserIdFromToken();
        
        //find The user
        $userCallTime = Users::where("id", $userId)->first()->call_time;

        //Id of the Location name
        $locationId = Location::where("name", $request->location_name)->first();

        $date = now('Asia/Manila')->toDateString();
        $time = now()->setTimezone('Asia/Manila')->format('H:i:s');
        $status = $this->isLate($userCallTime, $time);
        
        $today = Attendance::where('user_id', $userId)->whereDate('date', $date)->orderBy('id')->first();

        if ($today) {
            // never clocked (an Absent row, or one HR made without times), or still clocked in
            if ($today->time_in === null || $today->time_out === null) {
                AuditLog::record('check_in', 'clock_in', 'failed', 'Already clocked in today');
                return response()->json(['message' => 'You are already clocked in'], 409);
            }

            // Clocked out earlier today: this is another session of the same day. The day keeps its
            // first clock-in and status (Late / On-Time), and the hours of the sessions are added up.
            DB::transaction(function () use ($today, $time) {
                $today->ensureFirstSession();
                $today->sessions()->create(['time_in' => $time]);
                $today->update(['time_out' => null]); // clocked in again
            });
            AuditLog::record('check_in', 'clock_in', 'success', "Clocked in again at {$locationId->name}, {$time}");
            return response()->json($today->fresh(), 201);
        }

        $attendance = DB::transaction(function () use ($userId, $locationId, $status, $time) {
            $attendance = Attendance::create([
                'user_id' => $userId,
                'location_id' => $locationId->id,
                'status' => $status,
                'date' => now('Asia/Manila')->toDateString(),
                'time_in' => $time,
            ]);
            $attendance->sessions()->create(['time_in' => $time]);
            return $attendance;
        });
        
        AuditLog::record('check_in', 'clock_in', 'success', "{$status} at {$locationId->name}, {$time}");
        return response()->json($attendance, 201);
    }

    /**
     * The numbers on the Dashboard's top cards, for today. Everything counts active employees, each
     * one once, so On-Time + Late + Absent + On Leave + Not Yet In adds up to the total (an employee
     * who is on approved leave but clocked in anyway is counted in both of their own cards only).
     */
    public function getCounts(){
        $today = today();
        $activeIds = Users::active()->pluck('id');
        $employeesCount = $activeIds->count();

        // today's attendance of active employees, one row each
        $attendanceToday = Attendance::whereDate('date', $today)
            ->whereIn('user_id', $activeIds)
            ->select('status', 'user_id')
            ->get()
            ->unique('user_id');

        $onTime = $attendanceToday->where('status', 'On-Time')->count();
        $late = $attendanceToday->where('status', 'Late')->count();
        $absent = $attendanceToday->where('status', 'Absent')->count();

        // approved leave that covers today, each employee once
        $leaveIds = LeaveApplication::where('status', 'approved')
            ->whereDate('start_date', '<=', $today)
            ->whereDate('end_date', '>=', $today)
            ->whereIn('user_id', $activeIds)
            ->pluck('user_id')
            ->unique();
        $leave = $leaveIds->count();

        // "Not Yet In": no attendance today and not on leave. On a weekend or a holiday nobody is
        // expected, so it is 0 and the page says it is a non-working day.
        $nonWorkingDay = $today->isWeekend() || Holiday::whereDate('date', $today)->exists();
        $accounted = $attendanceToday->pluck('user_id')->merge($leaveIds)->unique();
        $notYetIn = $nonWorkingDay ? 0 : max(0, $employeesCount - $accounted->count());

        return response()->json([
            'employees' => $employeesCount,
            'on_time' => $onTime,
            'late' => $late,
            'absent' => $absent,
            'leave' => $leave,
            'not_yet_in' => $notYetIn,
            'non_working_day' => $nonWorkingDay,
        ]);
    }
    /**
     * The Dashboard's Employee List: every active employee, with what today looks like for them.
     *   ?page=1&per_page=5&search=maria
     * Status is the attendance of today (On-Time, Late, Absent); otherwise "On Leave" when an approved
     * leave covers today; otherwise "Non-working day" on a weekend or holiday; otherwise "Not Yet In".
     * Paged and searched by the database, so it stays small however many employees there are.
     */
    public function dashboardEmployees(Request $request)
    {
        $request->validate([
            'search'   => 'sometimes|nullable|string|max:100',
            'page'     => 'sometimes|integer|min:1',
            'per_page' => 'sometimes|integer|min:1|max:50',
        ]);
        $today = today();

        $query = Users::active()->select('id', 'name', 'department', 'position', 'contract_type')->orderBy('name')->orderBy('id');
        if ($term = trim((string) $request->input('search'))) {
            // % and _ typed by the user must not act as wildcards
            $query->where('name', 'like', '%' . addcslashes($term, '%_\\') . '%');
        }
        $page = $query->paginate((int) $request->input('per_page', 5));
        $ids = $page->getCollection()->pluck('id');

        // only the people on this page are looked up
        $attendance = Attendance::whereDate('date', $today)->whereIn('user_id', $ids)
            ->orderBy('id')->get(['user_id', 'status'])->unique('user_id')->keyBy('user_id');
        $onLeave = LeaveApplication::where('status', 'approved')
            ->whereDate('start_date', '<=', $today)->whereDate('end_date', '>=', $today)
            ->whereIn('user_id', $ids)->pluck('user_id')->flip();
        $nonWorkingDay = $today->isWeekend() || Holiday::whereDate('date', $today)->exists();

        $rows = $page->getCollection()->map(function ($u) use ($attendance, $onLeave, $nonWorkingDay) {
            $status = $attendance[$u->id]->status
                ?? ($onLeave->has($u->id) ? 'On Leave' : ($nonWorkingDay ? 'Non-working day' : 'Not Yet In'));

            return [
                'id'           => $u->id,
                'name'         => $u->name,
                'department'   => $u->department,
                'position'     => $u->position,
                'contractType' => $u->contract_type,
                'status'       => $status,
            ];
        })->values();

        return response()->json([
            'data'         => $rows,
            'current_page' => $page->currentPage(),
            'last_page'    => $page->lastPage(),
            'per_page'     => $page->perPage(),
            'total'        => $page->total(),
        ]);
    }

    public function flaggedAttendance(Request $request)
{
    $query = Attendance::whereHas('flaggedAttendances');

    if ($request->query('today')) {
        $query->whereDate('date', today());
    }

    $flagged = $query
        ->with(['user', 'location', 'flaggedAttendances' => function ($q) {
            $q->latest('out_at');
        }])
        ->withCount('flaggedAttendances')
        ->get();

    return response()->json($flagged);
}
    
    public function weeklyAttendance()
    {
        $employeesCount = Users::active()->count();
        $startOfWeek = Carbon::now()->startOfWeek(Carbon::MONDAY);
        $days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        $result = [];

        foreach ($days as $i => $dayName) {
            $date = $startOfWeek->copy()->addDays($i);

            $attendanceForDay = Attendance::whereDate('date', $date)
                ->select('status', 'user_id')
                ->get()
                ->unique('user_id');

            $onTime = 0;
            $late = 0;
            $absent = 0;
            foreach ($attendanceForDay as $value) {
                if ($value->status == "On-Time") $onTime++;
                elseif ($value->status == "Late") $late++;
                elseif ($value->status == "Absent") $absent++;
            }
            $leave = LeaveApplication::where('status', 'Approved')
                ->whereDate('start_date', '<=', $date)
                ->whereDate('end_date', '>=', $date)
                ->count();
            $result[] = [
                'day' => $dayName,
                'ontime' => $onTime,
                'late' => $late,
                'absent' => $absent,
                'leave' => $leave,
            ];
        }

        return response()->json($result);
    }
    public function frequentLates()
    {
        $counts = Attendance::where('status', 'Late')
            ->whereMonth('date', Carbon::now()->month)
            ->whereYear('date', Carbon::now()->year)
            ->selectRaw('user_id, count(*) as late_count')
            ->groupBy('user_id')
            ->having('late_count', '>=', 3)
            ->with('user:id,name')
            ->get();

        return response()->json([
            'count' => $counts->count(),
            'employees' => $counts,
        ]);
    }
    public function syncAbsences()
    {
        $abs = new AbsenceService();
        $created = $abs->sync(
            now('Asia/Manila')->startOfMonth(),
            now('Asia/Manila')->subDay()->startOfDay()
        );
        return response()->json(['message' => 'Absences synced', 'created' => $created]);
    }
}
