<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\AuditLog;
use App\Models\Location;

class LocationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $locations = Location::all();
        return response()->json($locations);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'longitude' => 'required',
            'latitude' => 'required',
            'radius' => 'required|numeric|min:10|max:50',
        ]);

        $locations = Location::create([
            'name' => $request->name,
            'longitude' => $request->longitude,
            'latitude' => $request->latitude,
            'radius' => $request->radius,
        ]);

        AuditLog::record('admin', 'location_added', 'success', "{$locations->name}, radius {$locations->radius} m");

        return response()->json($locations, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $locations = Location::find($id);
        if (!$locations) {
            return response()->json(['message' => 'Location not found'], 404);
        }
        else {
            return response()->json($locations);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {

        $locations = Location::find($id);
        if (!$locations) {
            return response()->json(['message' => 'Location not found'], 404);
        }
        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'latitude' => 'sometimes|required|numeric|between:-90,90',
            'longitude' => 'sometimes|required|numeric|between:-180,180',
            'radius' => 'sometimes|numeric|min:10|max:50',
        ]);
        $fields = $request->only(['name', 'latitude', 'longitude', 'radius']);
        $locations->update($fields);
        // a place moving or its radius changing decides who can clock in, so it is on record
        AuditLog::record('admin', 'location_updated', 'success', "{$locations->name}: changed " . implode(', ', array_keys($fields)) . ", radius now {$locations->radius} m");
        return response()->json($locations);
        
        
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $locations = Location::find($id);
        if (!$locations) {
            return response()->json(['message' => 'Location not found'], 404);
        }
        else{
        AuditLog::record('admin', 'location_deleted', 'success', $locations->name);
        $locations->delete();
        return response()->json(['message' => 'Location deleted successfully']);
        }
    }
}
