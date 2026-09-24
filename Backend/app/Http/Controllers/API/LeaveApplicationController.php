<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\LeaveApplication;
use App\Models\LeaveBalance;
use Carbon\Carbon;

class LeaveApplicationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $leaveApplications = LeaveApplication::with('user')->get();
        return response()->json($leaveApplications);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $userId = $this->getUserIdFromToken();

        $request->validate([
            'leave_type' => 'required|in:Sick Leave,Vacation Leave,Emergency Leave,Birthday Leave,Solo Parent Leave,Paternity Leave,Maternity Leave',
            'start_date' => 'required|date',
            'end_date' => 'required|date',
            'reason' => 'required',
        ]);
        $leaveBalData = LeaveBalance::where('user_id', $userId)->first();
        $leaveBal = $this->caseLeaveBal($request->leave_type, $leaveBalData);
        $days = $this->dateComp($request->start_date, $request->end_date);
        
        if ($days > $leaveBal['count']) {
            return response()->json(['message' => 'Insufficient leave balance'], 422);
        }
        
        $leaveApplication = LeaveApplication::create([
                'user_id' => $userId,
                'leave_balance_id' => $leaveBalData->id,
                'leave_type' => $request->leave_type,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'reason' => $request->reason,
                'status' => "Pending",
            ]);
        return response()->json(['message' => 'Leave Application Success Please Wait To Be Approved']);
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

        $leaveBalData = LeaveBalance::where('user_id', $leaveApplication->user_id)->first();
        $leaveBal = $this->caseLeaveBal($leaveApplication->leave_type, $leaveBalData);
        $days = $this->dateComp($leaveApplication->start_date, $leaveApplication->end_date);
        
        
        
        if($request->status == "Approved"){
            if ($days > $leaveBal['count']) {
                return response()->json(['message' => 'Insufficient leave balance'], 422);
            }
            $leaveBalData->decrement($leaveBal['type'], $days);
            $leaveApplication->status = $request->status;
            $leaveApplication->save();
            return response()->json(['message' => 'Leave Application Have Been Approved']);
        } elseif($request->status == "Rejected"){
            $leaveApplication->status = "Rejected";
            $leaveApplication->save();
            return response()->json(['message' => 'Leave Application Have Been Rejected']);
        }
        // $leaveApplication->update($request->all());
        // return response()->json($leaveApplication);
    

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

    function caseLeaveBal($leaveType, $leaveBalData){
        switch ($leaveType) {
            case 'Sick Leave':
                $leaveBalDataCont = [
                    "count" => $leaveBalData->sick,
                    "type" => "sick"
                    ];
                return $leaveBalDataCont;
                break;
            case 'Vacation Leave':
                $leaveBalDataCont = [
                    "count" => $leaveBalData->vacation,
                    "type" => "vacation"
                    ];
                return $leaveBalDataCont;
                break;
            case 'Emergency Leave':
                $leaveBalDataCont = [
                    "count" => $leaveBalData->emergency,
                    "type" => "emergency"
                    ];
                return $leaveBalDataCont;
                break;
            case 'Birthday Leave':
                $leaveBalDataCont = [
                    "count" => $leaveBalData->birthday,
                    "type" => "birthday"
                    ];
                return $leaveBalDataCont;
                break;
            case 'Solo Parent Leave':
                $leaveBalDataCont = [
                    "count" => $leaveBalData->solo_parent,
                    "type" => "solo_parent"
                    ];
                return $leaveBalDataCont;
                break;
            case 'Paternity Leave':
                $leaveBalDataCont = [
                    "count" => $leaveBalData->paternity,
                    "type" => "paternity"
                    ];
                return $leaveBalDataCont;
                break;
            case 'Maternity Leave':
                $leaveBalDataCont = [
                    "count" => $leaveBalData->maternity,
                    "type" => "maternity"
                    ];
                return $leaveBalDataCont;
                break;
            default:
                break;
        }
    }
}
