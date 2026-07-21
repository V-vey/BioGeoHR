<?php

namespace App\Http\Controllers\Feature;

use Illuminate\Http\Request;
use App\Service\GeoFenceService;
use App\Models\Location;
use App\Models\UserLocation;
use App\Models\Users;
use App\Models\Attendance;

class GeoFenceController
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
}
