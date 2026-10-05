<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Attendance;
use App\Models\Users;
use App\Models\Location;
use App\Models\LeaveApplication;
use App\Models\Holiday;
use App\Models\SystemSetting;
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
    public function index()
    {
        $attendances = Attendance::with(['user', 'location'])->get();
         $formatted = $attendances->map(function ($a) {
        return [
            'date' => $a->date,
            'location' => $a->location?->name ?? 'Unknown Location',
            'name' => $a->user?->name,
            'department' => $a->user?->department,
            'position' => $a->user?->position,
            'contractType' => $a->user?->contract_type,
            'status' => $a->status,
            'clockIn' => $a->time_in,
            'clockOut' => $a->time_out,
        ];
    });
        return response()->json($formatted);
    }
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

        return response()->json($attendance, $attendance->wasRecentlyCreated ? 201 : 200);
    }
    /**
     * Display the specified resource.
     */
    public function show()
    {
        $userId = $this->getUserIdFromToken();
        $attendance = Attendance::with('location')->where('user_id', $userId)->get();

        if (!$attendance) {
            return response()->json(['message' => 'Attendance record not found'], 404);
        }
        $formattedData = $attendance->map(function ($attendance) {
            return [
                'location'  => $attendance->location ? $attendance->location->name : 'Unknown Location',
                'date'      => $attendance->date,
                'status'    => $attendance->status,
                'clock_in'  => $attendance->time_in,
                'clock_out' => $attendance->time_out
            ];
        });
        return response()->json($formattedData);
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
        $late = Attendance::where("user_id", $userId)
        ->where("status", "On-time")->count();
        return response()->json(['message' => $late]);
    }

    /*
        RECENT ATTENDANCE FUNCTION
    */
    public function recentAttendance(){
        $userId = $this->getUserIdFromToken();

        $recent = Attendance::where("user_id", $userId)->whereNotNull("time_out")->latest()->first();
        $location = Location::where('id', $recent->location_id)->first();
        // $timeIn = $recent->time_in->format('g:iA');
        // $timeOut = $recent->time_out->format('g:iA');
        return response()->json([
            'location' => $location->name,
            'date' => $recent->date,
            'status' => $recent->status,
            'clock_in' => $recent->time_in,
            'clock_out' => $recent->time_out
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
        $attendance->update([
            'time_out' => $time,
        ]);
        return $attendance;
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
        
        if (Attendance::where('user_id', $userId)->whereDate('date', $date)->exists()) {
            return response()->json(['message' => 'You have already clocked in today'], 409);
        }

        $attendance = Attendance::create([
            'user_id' => $userId,
            'location_id' => $locationId->id,
            'status' => $status, 
            'date' => now('Asia/Manila')->toDateString(),
            'time_in' => $time,
        ]);
        
        return response()->json($attendance, 201);
    }

    public function getCounts(){
        $attendanceToday = Attendance::whereDate('date', today())
            ->select('status', 'user_id')
            ->get()
            ->unique('user_id');
        
        $employeesCount = Users::All()->count();
        $onTime = 0;
        $late = 0;
        $absent = 0;
        $leave = 0;
        
        $leave = LeaveApplication::where("status", "approved")
            ->whereDate("start_date", "<=", today())
            ->whereDate("end_date", ">=", today())
            ->count();
        // $leaveData = LeaveApplication::all();
        //verify avoid dup
        $usersVer = [];
        foreach ($attendanceToday as $value) {
        
            if($value->status == "On-Time" ){
                $onTime = $onTime + 1;
            }
            elseif($value->status == "Late"){
                $late = $late + 1;
            } elseif($value->status == "Absent"){
                $absent = $absent + 1;
            }

        }

        return response()->json([
            'employees' => $employeesCount,
            'on_time' => $onTime,
            'late' => $late,
            'absent' => $absent, 
            'leave' => $leave
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
        $employeesCount = Users::all()->count();
        $startOfWeek = Carbon::now()->startOfWeek(Carbon::SUNDAY);
        $days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
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
