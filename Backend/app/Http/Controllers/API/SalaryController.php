<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Salary;

class SalaryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $salary = Salary::all();
        return response()->json($salary);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required',
            'attendance_id' => 'required',
            'salary_basis' => 'required',
            'working_hours_per_day' => 'required',
            'working_days_per_month' => 'required',
        ]);

        $salary = Salary::create([
            'user_id' => $request->user_id,
            'attendance_id' => $request->attendance_id,
            'salary_basis' => $request->salary_basis,
            'working_hours_per_day' => $request->working_hours_per_day,
            'working_days_per_month' => $request->working_days_per_month,
        ]);

        return response()->json($salary, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $salary = Salary::find($id);
        if (!$salary) {
            return response()->json(['message' => 'Salary record not found'], 404);
        }else {
            return response()->json($salary);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $salary = Salary::find($id);

        if (!$salary) {
            return response()->json(['message' => 'Salary record not found'], 404);
        }else{
            $salary->update($request->all());
            return response()->json($salary);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $salary = Salary::find($id);

        if (!$salary) {
            return response()->json(['message' => 'Salary record not found'], 404);
        }else {
            $salary->delete();
            return response()->json(['message' => 'Salary record deleted successfully']);
        }

        
    }
}
