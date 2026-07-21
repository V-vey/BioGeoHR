<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\UserLocation;

class UserLocationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $userLocation = UserLocation::all();

        return response()->json($userLocation);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required',
            'location_id' => 'required',
            'attendance_id' => 'required',
            'latitude' => 'required',
            'longitude' => 'required'
        ]);

        $request = UserLocation::create([
            'user_id' => $request -> user_id,
            'location_id' => $request -> location_id,
            'attendance_id' => $request -> attendance_id,
            'latitude' => $request -> latitude,
            'longitude' => $request -> longitude
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {

        $userLocation = UserLocation::find($id);
        if (!$userLocation){
            return response() -> json(['message' => 'User not found'], 404);
        } else{
            return response() -> json($userLocation);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $userLocation = UserLocation::find($id);
        if (!$userLocation){
            return response() -> json(['message' => 'User not Found'], 404);
        } else {
            $userLocation -> update($request->all());
            return response()->json($userLocation);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $userLocation = UserLocation::find($id);
        if (!$userLocation){
            return response() -> json(['message' => 'User not Found'], 404);
        } else {
            $userLocation->delete();
            return response() -> json(['message' => 'User Location is deleted successfully']);
        }
    }
}
