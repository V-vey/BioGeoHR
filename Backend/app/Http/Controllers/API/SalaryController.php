<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Salary;
use App\Models\Holiday;
use App\Models\LeaveApplication;
use App\Models\AuditLog;
use App\Service\SalaryService;

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
            'salary_basis' => 'required',
            'working_hours_per_day' => 'required',
            'working_days_per_month' => 'required',
        ]);

        $salary = Salary::create([
            'user_id' => $request->user_id,
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
            AuditLog::record('admin', 'salary_updated', 'success', "Salary record #{$id}");
            $salary->update($request->all());
            return response()->json($salary);
        }
    }

    /**
     * The logged-in employee's own salary (the phone's Salary Info card).
     */
    public function mine()
    {
        $salary = Salary::where('user_id', $this->getUserIdFromToken())
            ->orderByDesc('id')
            ->first();

        if (!$salary || !$salary->salary_basis) {
            return response()->json(['message' => 'No salary record yet'], 404);
        }

        $service = new SalaryService();
        $daily = $service->dailyWage($salary->salary_basis, $salary->working_days_per_month);
        $hourly = $service->hourlyRate($daily, $salary->working_hours_per_day);

        return response()->json([
            'monthly_salary' => (float) $salary->salary_basis,
            'working_hours_per_day' => (float) $salary->working_hours_per_day,
            'working_days_per_month' => (float) $salary->working_days_per_month,
            'daily_rate' => round($daily, 2),
            'hourly_rate' => round($hourly, 2),
        ]);
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
