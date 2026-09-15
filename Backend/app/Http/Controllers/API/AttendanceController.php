<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Attendance;
use App\Models\Users;
use App\Models\Location;
use App\Http\Controllers\Feature\AttendanceService;

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
        $attendances = Attendance::all();
        return response()->json($attendances);
    }
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        
        $request->validate([

            'location_name' => 'required',
        ]);
        //service of Status::

        // $attendance = $this->attendance->createAttendance($request);

        return response()->json($attendance, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show()
    {
        $userId = $this->getUserIdFromToken();
        $attendance = Attendance::with('location')->where('user_id', $userId)->get();;

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
        $late = Attendance::where("user_id", $userId)->where("status", "Late")->count();
        return response()->json(['message' => $late]);
    }
    /*
        On Time COUNT FUNCTION
    */
    public function countOnTime(){
        $userId = $this->getUserIdFromToken();

        // $attendance = Attendance::where("user_id", $userId)->get();
        $late = Attendance::where("user_id", $userId)->where("status", "On-time")->count();
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
        
        if (!$attendance) {
            return response()->json(['message' => 'Attendance record not found'], 404);
        }

        $time = now()->setTimezone('Asia/Manila')->format('H:i:s');
        $attendance->update([
            'time_out' => $time,
        ]);
        return $attendance;
    }

    private function isLate($userCallTime,$timeIn){
        
        if ($userCallTime>$timeIn){
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


        $time = now()->setTimezone('Asia/Manila')->format('H:i:s');
        $status = $this->isLate($userCallTime, $time);
        $attendance = Attendance::create([
            'user_id' => $userId,
            'location_id' => $locationId->id,
            'status' => $status, 
            'date' => today()->toDateString(), // bug
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
        
        //verify avoid dup
        $usersVer = [];
        foreach ($attendanceToday as $value) {
        
            if($value->status == "On-Time" ){
                $onTime = $onTime + 1;
            }
            elseif($value->status == "Late"){
                $late = $late + 1;
            }

        }

        $totalAttedance = $onTime + $late;
        $absent = $employeesCount - $totalAttedance;
        
        return response()->json([
            'employees' => $employeesCount,
            'on_time' => $onTime,
            'late' => $late,
            'absent' => $absent, 
            'leave' => $leave
        ]);
        // return response()->json($attendanceToday);
        
    }
}
