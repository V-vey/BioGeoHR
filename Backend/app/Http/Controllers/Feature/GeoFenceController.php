<?php

namespace App\Http\Controllers\Feature;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Service\GeoFenceService;
use App\Models\Location;
use App\Models\UserLocation;
use App\Models\Users;
use App\Models\Attendance;

class GeoFenceController extends Controller
{
    public function __construct(GeoFenceService $geofence)
    {
        $this->geofence = $geofence;

    }

    public function validationLocation(Request $request){
        
        // $request->validate([
        //     'userLong' => 'required',
        //     'userLat' => 'required',
        //     'locationName' => 'required',
        // ]);
        $location = Location::where("name", $request->locationName)->first();

        $haversineCal = $this->geofence->calculateDistance(
            $location->latitude,
            $location->longitude,
            $request->userLat,
            $request->userLong,
        );

        //Check if Its on Range
        if($haversineCal <= $location->radius){
            return response()-> json(['message' => "In Range $haversineCal"], 200);
        } else {
            return response()-> json(['message' => "Out Of Range $haversineCal"], 300);
        }
        
    }
    public function periodicCheck(Request $request)
    {
        $request->validate([
            'userLat' => 'required',
            'userLong' => 'required',
        ]);

        $userId = $this->getUserIdFromToken();

        $attendance = Attendance::where('user_id', $userId)
            ->whereNull('time_out')
            ->latest()
            ->first();

        if (!$attendance) {
            return response()->json(['message' => 'No active attendance session found'], 404);
        }

        $location = Location::find($attendance->location_id);

        $distance = $this->geofence->calculateDistance(
            $location->latitude,
            $location->longitude,
            $request->userLat,
            $request->userLong,
        );

        if ($distance > $location->radius) {
            $attendance->out_of_boundary = true;
            $attendance->out_of_boundary_at = now();
            $attendance->save();

            return response()->json(['message' => 'Out of boundary flagged', 'distance' => $distance]);
        }

        return response()->json(['message' => 'Within boundary', 'distance' => $distance]);
    }
}
