<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Payslip;
use App\Models\Users;
use App\Models\Loan;
use App\Service\SalaryService;

class PayslipController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $payslips = Payslip::with('user')->get();
        return response()->json($payslips);
    }

    /**
     * Run payroll for all employees for a given pay period.
     */
    public function run(Request $request)
    {
        $request->validate([
            'period_start' => 'required|date',
            'period_end' => 'required|date',
            'excluded_ids' => 'sometimes|array',
        ]);

        $isDesignatedCutoff = \Carbon\Carbon::parse($request->period_start)->day >= 16;
        $salaryService = new SalaryService();
        $created = [];

        $employees = Users::with('salary')->get();

        foreach ($employees as $employee) {
            if (!$employee->salary) {
                continue;
            }
            if (in_array($employee->id, $request->input('excluded_ids', []))) {
                continue;
            }
            $alreadyExists = Payslip::where('user_id', $employee->id)
            ->where('period_start', $request->period_start)
            ->where('period_end', $request->period_end)
            ->exists();
            if ($alreadyExists) {
                continue;
            }
            $result = $salaryService->paycheck(
                $employee->salary->salary_basis,
                $employee->salary->working_days_per_month,
                $employee->salary->working_hours_per_day,
                $employee->id,
                // overtime Comment
                // $request->period_start,
                // $request->period_end,
            );

            $loanDeduction = 0;
            $loan = null;
            if ($isDesignatedCutoff) {
                $loan = Loan::where('user_id', $employee->id)
                    ->where('status', 'Active')
                    ->first();
                if ($loan) {
                    $loanDeduction = min($loan->monthly_deduction, $loan->remaining_balance);
                    
                }
            }

            $netPay = $result['net_pay'] - $loanDeduction;

            if ($netPay < 0) {
                $loanDeduction = $loanDeduction + $netPay;
                $netPay = 0;
            }

            if ($loan && $loanDeduction > 0) {
                $loan->decrement('remaining_balance', $loanDeduction);
                if ($loan->fresh()->remaining_balance <= 0) {
                    $loan->status = 'Paid';
                    $loan->paid_off_period_start = $request->period_start;
                    $loan->paid_off_period_end = $request->period_end;
                    $loan->save();
                }
            }

            $payslip = Payslip::create([
                'user_id' => $employee->id,
                'period_start' => $request->period_start,
                'period_end' => $request->period_end,
                'gross_salary' => $employee->salary->salary_basis,
                'sss' => $result['sss'],
                'philhealth' => $result['philhealth'],
                'pagibig' => $result['pagibig'],
                'late_deduction' => $result['late_deduction'],
                'loan_deduction' => $loanDeduction,
                'net_pay' => $netPay,
                'income_tax' => $result['income_tax'],
                // overtime Comment
                // 'overtime_pay' => $result['overtime_pay'],
            ]);

            $created[] = $payslip;
        }

        return response()->json([
            'message' => count($created) . ' payslips generated',
            'payslips' => $created,
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $payslip = Payslip::with('user')->find($id);
        if (!$payslip) {
            return response()->json(['message' => 'Payslip not found'], 404);
        }
        return response()->json($payslip);
    }
    public function preview(Request $request)
    {
        $request->validate([
            'period_start' => 'required|date',
            'period_end' => 'required|date',
            
        ]);
        $isDesignatedCutoff = \Carbon\Carbon::parse($request->period_start)->day >= 16;
        $salaryService = new SalaryService();
        $preview = [];

        $employees = Users::with('salary')->get();

        foreach ($employees as $employee) {
            if (!$employee->salary) {
                continue;
            }

            $result = $salaryService->paycheck(
                $employee->salary->salary_basis,
                $employee->salary->working_days_per_month,
                $employee->salary->working_hours_per_day,
                $employee->id,

                // overtime Comment
                // $request->period_start,
                // $request->period_end,
            );

            $loanDeduction = 0;
            if ($isDesignatedCutoff) {
                $loan = Loan::where('user_id', $employee->id)
                    ->where('status', 'Active')
                    ->first();
                if ($loan) {
                    $loanDeduction = min($loan->monthly_deduction, $loan->remaining_balance);
                }
            }

            $netPay = $result['net_pay'] - $loanDeduction;
            if ($netPay < 0) {
                $loanDeduction = $loanDeduction + $netPay;
                $netPay = 0;
            }

            $preview[] = [
                'user_id' => $employee->id,
                'name' => $employee->name,
                'gross_salary' => $employee->salary->salary_basis,
                'sss' => $result['sss'],
                'philhealth' => $result['philhealth'],
                'pagibig' => $result['pagibig'],
                'income_tax' => $result['income_tax'],
                'late_deduction' => $result['late_deduction'],
                'loan_deduction' => $loanDeduction,
                'net_pay' => $netPay,
                // overtime Comment
                // 'overtime_pay' => $result['overtime_pay'],
            ];
        }

        return response()->json($preview);
    }
}