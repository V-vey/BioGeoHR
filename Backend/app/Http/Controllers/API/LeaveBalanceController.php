<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\LeaveBalance;

class LeaveBalanceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $leaveBalances = LeaveBalance::all();
        return response()->json($leaveBalances);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required',
            'annual_leave' => 'required',
            'sick_leave' => 'required',
            'patternity_leave' => 'required',
            'unpaid_leave' => 'required',
        ]);

        $leaveBalance = LeaveBalance::create([
            'user_id' => $request->user_id,
            'annual_leave' => $request->annual_leave,
            'sick_leave' => $request->sick_leave,
            'patternity_leave' => $request->patternity_leave,
            'unpaid_leave' => $request->unpaid_leave,
        ]);

        return response()->json($leaveBalance, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $leaveBalance = LeaveBalance::where("user_id",$id)->first();

        if (!$leaveBalance) {
            return response()->json(['message' => 'Leave balance record not found'], 404);
        }
        else {
            return response()->json($leaveBalance);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $leaveBalance = LeaveBalance::find($id);

        if (!$leaveBalance) {
            return response()->json(['message' => 'Leave balance record not found'], 404);
        }
        else{
            $leaveBalance->update($request->all());
            return response()->json($leaveBalance);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $leaveBalance = LeaveBalance::find($id);

        if (!$leaveBalance) {
            return response()->json(['message' => 'Leave balance record not found'], 404);
        }
        else{
            $leaveBalance->delete();
            return response()->json(['message' => 'Leave balance record deleted successfully']);
        }
    }
}
