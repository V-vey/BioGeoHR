<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Attendance;
use App\Models\Location;
use App\Http\Controllers\Feature\AttendanceService;


class AttendanceController extends Controller
{
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
            'user_id' => 'required',
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
}
