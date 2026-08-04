<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Attendance;
use App\Models\Location;
use App\Http\Controllers\Feature\AttendanceService;

use Laravel\Sanctum\PersonalAccessToken; 
class AttendanceController extends Controller
{
    //For the Service Callback
    public function __construct(AttendanceService $attendance)
    {
        $this->attendance = $attendance;

    }
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

        $attendance = $this->attendance->createAttendance($request);

        return response()->json($attendance, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $attendance = Attendance::find($id);
        if (!$attendance) {
            return response()->json(['message' => 'Attendance record not found'], 404);
        }
        else {
            return response()->json($attendance);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $attendance = Attendance::find($id);
            
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
    public function destroy(string $id)
    {
        $attendance = Attendance::find($id);

        if (!$attendance) {
            return response()->json(['message' => 'Attendance record not found'], 404);
        }
        else{
            $attendance->delete();
            return response()->json(['message' => 'Attendance record deleted successfully']);
        }
    }

    public function countLate(){
        //The User Token
        $rawTokenString = request()->bearerToken();    
        
        //Access Token
        $token = PersonalAccessToken::findToken($rawTokenString);
        $userId = $token?->tokenable_id;

        // $attendance = Attendance::where("user_id", $userId)->get();
        $late = Attendance::where("user_id", $userId)->where("status", "Late")->count();
        return response()->json(['message' => $late]);
    }
    public function recentAttendance(){
        //The User Token
        $rawTokenString = request()->bearerToken();    
        
        //Access Token
        $token = PersonalAccessToken::findToken($rawTokenString);
        $userId = $token?->tokenable_id;

        $recent = Attendance::where("user_id", $userId)->whereNotNull("time_out")->latest()->first();
        $location = Location::where('id', $recent->location_id)->first();
        $timeIn = $recent->time_in->format('g:iA');
        $timeOut = $recent->time_out->format('g:iA');
        return response()->json([
            'location' => $location->name,
            'date' => $recent->date,
            'status' => $recent->status,
            'clock_in' => $timeIn,
            'clock_out' => $timeOut
        ]);
    }
}
