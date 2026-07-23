<?php
namespace App\Http\Controllers\Feature;
use App\Models\Users;
use App\Models\Attendance;
use App\Models\Location;

class AttendanceService
{

    public function isLate($userCallTime,$timeIn){
        
        if ($userCallTime>$timeIn){
            return "On-Time";
        }
        return "Late";
    }

    public function createAttendance($request){
        $userCallTime = Users::where("id", $request->user_id)->first()->call_time;
        $locationId = Location::where("name", $request->location_name)->first();
        $time = now()->setTimezone('Asia/Manila')->format('H:i:s');
        $status = $this->isLate($userCallTime, $time);
        $attendance = Attendance::create([
            'user_id' => $request->user_id,
            'location_id' => $locationId->id,
            'status' => $status, 
            'date' => today()->toDateString(),
            'time_in' => $time,
        ]);
        return $attendance;
    }
    public function clockOut($id){
        $attendance = Attendance::find($id);
        $time = now()->setTimezone('Asia/Manila')->format('H:i:s');
        $attendance->update([
            'time_out' => $time,
        ]);
        return $attendance;
    }
}