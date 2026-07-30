<?php
namespace App\Http\Controllers\Feature;
use App\Models\Users;
use App\Models\Attendance;
use App\Models\Location;
use Illuminate\Http\Request;

use Laravel\Sanctum\PersonalAccessToken;

class AttendanceService
{

    public function isLate($userCallTime,$timeIn){
        
        if ($userCallTime>$timeIn){
            return "On-Time";
        }
        return "Late";
    }

    public function createAttendance($request){

        //The User Token
        $rawTokenString = $request->bearerToken();    
        
        //Access Token
        $token = PersonalAccessToken::findToken($rawTokenString);
        $userId = $token?->tokenable_id;

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
        return $attendance;
    }
    public function clockOut(Request $request){
        //The User Token
        $rawTokenString = request()->bearerToken();    
        
        //Access Token
        $token = PersonalAccessToken::findToken($rawTokenString);
        $userId = $token?->tokenable_id;

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
}