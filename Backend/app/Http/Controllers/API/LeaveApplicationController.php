<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\LeaveApplication;

class LeaveApplicationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $leaveApplications = LeaveApplication::all();
        return response()->json($leaveApplications);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required',
            'leave_balance_id' => 'required',
            'leave_type' => 'required',
            'start_date' => 'required|date',
            'end_date' => 'required|date',
            'reason' => 'required',
            'status' => 'required',
        ]);
        $leaveApplication = LeaveApplication::create([
            'user_id' => $request->user_id,
            'leave_balance_id' => $request->leave_balance_id,
            'leave_type' => $request->leave_type,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'reason' => $request->reason,
            'status' => $request->status,
        ]);

        return response()->json($leaveApplication, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $leaveApplication = LeaveApplication::find($id);
        if (!$leaveApplication) {
            return response()->json(['message' => 'Leave application not found'], 404);
        }
        else {
            return response()->json($leaveApplication);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $leaveApplication = LeaveApplication::find($id);

        if (!$leaveApplication) {
            return response()->json(['message' => 'Leave application not found'], 404);
        }
        else{
            $leaveApplication->update($request->all());
            return response()->json($leaveApplication);
        }

    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $leaveApplication = LeaveApplication::find($id);

        if (!$leaveApplication) {
            return response()->json(['message' => 'Leave application not found'], 404);
        }
        else{
            $leaveApplication->delete();
            return response()->json(['message' => 'Leave application deleted successfully']);
        }
    }
}
