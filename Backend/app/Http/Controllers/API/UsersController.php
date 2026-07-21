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
            'role' => 'required',
            'position' => 'required',
            'joined_date' => 'required|date',
            'contract_type' => 'required',
            'gender' => 'required',
            'date_of_birth' => 'required|date',
            'address' => 'required',
        ]);

        $users = Users::create([
            'name' => $request->name,
            'email' => $request->email,
            'contact_number' => $request->contact_number,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'position' => $request->position,
            'joined_date' => $request->joined_date,
            'contract_type' => $request->contract_type,
            'gender' => $request->gender,
            'date_of_birth' => $request->date_of_birth,
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
}
