<?php

namespace App\Http\Controllers\Feature;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Service\GeoFenceService;
use App\Models\Location;
use App\Models\UserLocation;
use App\Models\Users;
use App\Models\Attendance;
use App\Models\FlaggedAttendance;
use App\Models\AuditLog;

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
            AuditLog::record('check_in', 'geofence_check', 'success', "In range at {$location->name}: {$haversineCal} m");
            return response()-> json(['message' => "In Range $haversineCal"], 200);
        } else {
            AuditLog::record('check_in', 'geofence_check', 'failed', "Out of range at {$location->name}: {$haversineCal} m");
            return response()-> json(['message' => "Out Of Range $haversineCal"], 300);
        }
        
    }
    public function periodicCheck(Request $request)
    {
        $request->validate([
            'userLat' => 'required',
            'userLong' => 'required',
        ]);

        $attendance = $this->openSession($this->getUserIdFromToken());

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
            $openExcursion = FlaggedAttendance::where('attendance_id', $attendance->id)
                ->whereNull('in_at')
                ->latest()
                ->first();

            if (!$openExcursion) {
                FlaggedAttendance::create([
                    'attendance_id' => $attendance->id,
                    'out_at' => now(),
                ]);

                AuditLog::record('check_in', 'out_of_boundary', 'failed', "Flagged outside geofence at {$location->name}, distance: {$distance}m");
            }

            return response()->json(['message' => 'Out of boundary flagged', 'distance' => $distance]);
        }

        $openExcursion = FlaggedAttendance::where('attendance_id', $attendance->id)
            ->whereNull('in_at')
            ->latest()
            ->first();

        if ($openExcursion) {
            $openExcursion->in_at = now();
            $openExcursion->save();
        }

        return response()->json(['message' => 'Within boundary', 'distance' => $distance]);
    }

    /**
     * The phone's periodic check found the GPS off while the employee is clocked in. The place cannot be
     * checked, so it is flagged like leaving the area: the next check that finds them in range closes it.
     * The app sends nothing; the audit sentence is written here.
     */
    public function periodicGpsOff()
    {
        $attendance = $this->openSession($this->getUserIdFromToken());

        if (!$attendance) {
            return response()->json(['message' => 'No active attendance session found'], 404);
        }

        $openExcursion = FlaggedAttendance::where('attendance_id', $attendance->id)
            ->whereNull('in_at')
            ->exists();

        // one flag and one audit line while it stays off, not one every check
        if (!$openExcursion) {
            FlaggedAttendance::create([
                'attendance_id' => $attendance->id,
                'out_at' => now(),
            ]);
            $place = Location::find($attendance->location_id)?->name;
            AuditLog::record('check_in', 'gps_off', 'failed', "GPS/Location turned off while clocked in at {$place} (Mobile)");
        }

        return response()->json(['message' => 'GPS off flagged']);
    }

    /** Today's clock-in that is still running, or null. */
    private function openSession(?int $userId): ?Attendance
    {
        return Attendance::where('user_id', $userId)
            ->whereDate('date', now('Asia/Manila')->toDateString()) // today only, not a forgotten earlier day
            ->whereNotNull('time_in')                                // a real clock-in, not an Absent row
            ->whereNotNull('location_id')                            // has a place to measure against
            ->whereNull('time_out')                                  // still clocked in
            ->first();
    }
}
