<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Users;
use Illuminate\Support\Facades\Hash;
use App\Models\LeaveBalance;

class UsersController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $users = Users::all();

        return response()->json($users);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'email' => 'required|email',
            'contact_number' => 'required',
            'password' => 'required',
            'department' => 'required',
            'position' => 'required',
            'call_time' => 'required',
            'contract_type' => 'required',
            'date_of_birth' => 'required|date',
            'gender' => 'required',
            'nationality' => 'required',
            'address' => 'required'
        ]);

        $users = Users::create([
            'name' => $request->name,
            'email' => $request->email,
            'contact_number' => $request->contact_number,
            'password' => Hash::make($request->password),
            'department' => $request->department,
            'position' => $request->position,
            'call_time' => $request->call_time,
            'contract_type' => $request->contract_type,
            'date_of_birth' => $request->date_of_birth,
            'gender' => $request->gender,
            'nationality' => $request->nationality,
            'address' => $request->address,
        ]);

        //Create a Balance
        LeaveBalance::create([
            'user_id' => $users->id,
            'annual_leave' => 5,
            'sick_leave' => 5,
            'patternity_leave' => 7,
            'unpaid_leave' => 9,
        ]);

        return response()->json($users, 201);

    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $users = Users::find($id);
        if (!$users) {
            return response()->json(['message' => 'User not found'], 404);
        }
        else {
            return response()->json($users);
        }

    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $users = Users::find($id);
        if (!$users) {
            return response()->json(['message' => 'User not found'], 404);
        }
        else{
            $users->update($request->all());
            return response()->json($users);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $users = Users::find($id);
        if (!$users) {
            return response()->json(['message' => 'User not found'], 404);
        }
        else {
            $users->delete();
            return response()->json(['message' => 'User deleted successfully']);
        }
    }
    public function userProfileDetails(){
        $userId = $this->getUserIdFromToken();

        $user = Users::where('id', $userId)->first();
        
        //add pic soon
        return response()->json([
            'name' => $user->name,
            'email' => $user->email,
            'contact' => $user->contact_number,
            'department' => $user->department,
            'position' => $user->position,
            'date_of_birth' => $user->date_of_birth,
            'gender' => $user->gender,
            'nationality' => $user->nationality,
            'address' => $user->address,
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at
        ]);
    }
    public function mobileUI(){

        // load all ui
        //recent 
        //user profile 
        //salary
        //late
        //all
    }
}
