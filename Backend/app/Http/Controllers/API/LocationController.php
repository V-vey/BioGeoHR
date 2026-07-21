<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
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
            'radius' => 'required',
        ]);

        $locations = Location::create([
            'name' => $request->name,
            'longitude' => $request->longitude,
            'latitude' => $request->latitude,
            'radius' => $request->radius,
        ]);

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
        else{
            $locations->update($request->all());
            return response()->json($locations);
        }
        
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
        $locations->delete();
        return response()->json(['message' => 'Location deleted successfully']);
        }
    }
}
