<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\AuditLog;
use App\Models\LeaveBalance;
use App\Models\Users;

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

    public function mine()
    {
        $balance = LeaveBalance::where('user_id', $this->getUserIdFromToken())->first();

        if (!$balance) {
            return response()->json(['message' => 'No leave balance found'], 404);
        }

        return response()->json($balance->only([
            'sick', 'vacation', 'emergency', 'birthday', 'solo_parent', 'paternity', 'maternity',
        ]));
    }

    /**
     * The start of a school year: every active Regular employee gets the full credits again, nothing is
     * carried over (the paper's leave policy). Probationary employees stay at 0.
     */
    public function resetAll()
    {
        $count = LeaveBalance::whereIn('user_id', Users::active()->where('contract_type', 'Regular')->select('id'))
            ->update(LeaveBalance::FULL_CREDITS);
            $count = LeaveBalance::whereIn('user_id', Users::active()->where('contract_type', 'Probationary')->select('id'))
            ->update([
                'sick' => 2,
                'vacation' => 2,
                'emergency' => 2,
                'birthday' => 1,
                'solo_parent' => 0,
                'paternity' => 0,
                'maternity' => 0,
            ]);

        AuditLog::record('admin', 'leave_credits_reset', 'success', "{$count} employee(s)");

        return response()->json([
            'message' => "Leave credits reset for {$count} employee(s)",
            'count' => $count,
        ]);
    }
}
