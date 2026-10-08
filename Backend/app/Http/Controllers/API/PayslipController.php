<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Payslip;
use App\Models\Users;
use App\Models\Loan;
use App\Models\Attendance;
use App\Models\LeaveApplication;
use App\Models\AuditLog;
use App\Service\SalaryService;
use Carbon\Carbon;
use App\Service\AbsenceService;

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

        $isDesignatedCutoff = Carbon::parse($request->period_start)->day >= 16;
        $salaryService = new SalaryService();
        $created = [];

        $employees = Users::active()->with('salary')->get();
        $periodFrom = Carbon::parse($request->period_start)->startOfDay();
        $periodTo   = Carbon::parse($request->period_end)->startOfDay()
                        ->min(now('Asia/Manila')->subDay()->startOfDay());

        if ($periodFrom->lte($periodTo)) {
            (new AbsenceService())->sync($periodFrom, $periodTo);
        }

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
                $request->period_start,
                $request->period_end,
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

        AuditLog::record('admin', 'payroll_run', 'success', "{$request->period_start} to {$request->period_end}: " . count($created) . " payslips");
        return response()->json([
            'message' => count($created) . ' payslips generated',
            'payslips' => $created,
        ]);
    }

    /**
     * Display the specified resource.
     */
    /**
     * FR30: attendance and salary details of each employee for one pay period.
     * Pay figures are per payslip, the same amounts the Payslips page shows
     * (gross, contributions and late deduction are stored monthly, so they are halved).
     */
    public function report(Request $request)
    {
        $request->validate([
            'period_start' => 'required|date',
            'period_end'   => 'required|date|after_or_equal:period_start',
        ]);
        $from = Carbon::parse($request->period_start)->toDateString();
        $to   = Carbon::parse($request->period_end)->toDateString();

        $payslips = Payslip::with('user:id,name,department,position')
            ->where('period_start', $from)
            ->where('period_end', $to)
            ->get();

        // days per status, one query for everybody
        $counts = Attendance::whereBetween('date', [$from, $to])
            ->selectRaw('user_id, status, COUNT(*) as days')
            ->groupBy('user_id', 'status')
            ->get()
            ->groupBy('user_id');

        // seconds worked, one query for everybody
        $seconds = Attendance::whereBetween('date', [$from, $to])
            ->whereNotNull('time_in')
            ->whereNotNull('time_out')
            ->whereColumn('time_out', '>=', 'time_in')
            ->selectRaw('user_id, SUM(TIME_TO_SEC(TIMEDIFF(time_out, time_in))) as secs')
            ->groupBy('user_id')
            ->pluck('secs', 'user_id');

        // approved leave that overlaps the period
        $leaves = LeaveApplication::where('status', 'Approved')
            ->whereDate('start_date', '<=', $to)
            ->whereDate('end_date', '>=', $from)
            ->get()
            ->groupBy('user_id');

        $rows = $payslips->map(function ($p) use ($counts, $seconds, $leaves, $from, $to) {
            $byStatus = ($counts[$p->user_id] ?? collect())->pluck('days', 'status');

            // only the days of each leave that fall inside the period
            $leaveDays = ($leaves[$p->user_id] ?? collect())->sum(function ($l) use ($from, $to) {
                $start = Carbon::parse($l->start_date)->max(Carbon::parse($from));
                $end   = Carbon::parse($l->end_date)->min(Carbon::parse($to));
                return $start->lte($end) ? (int) $start->diffInDays($end) + 1 : 0;
            });

            $gross   = $p->gross_salary / 2;
            $gov     = ($p->sss + $p->philhealth + $p->pagibig) / 2;
            $lateDed = $p->late_deduction / 2;
      
            $other   = ($gross - $p->net_pay) - ($gov + $p->income_tax + $lateDed + $p->loan_deduction);

            $absentDays  = (int) ($byStatus['Absent'] ?? 0);
            $absenceDed  = ($absentDays > 0 && $other > 0.01) ? $other : 0;
            $other      -= $absenceDed;

            return [
                'user_id'           => $p->user_id,
                'name'              => $p->user?->name,
                'department'        => $p->user?->department,
                'position'          => $p->user?->position,
                'on_time'           => (int) ($byStatus['On-Time'] ?? 0),
                'late'              => (int) ($byStatus['Late'] ?? 0),
                'absent'            => (int) ($byStatus['Absent'] ?? 0),
                'leave_days'        => $leaveDays,
                'hours'             => round(($seconds[$p->user_id] ?? 0) / 3600, 1),
                'gross'             => round($gross, 2),
                'government'        => round($gov, 2),
                'tax'               => round($p->income_tax, 2),
                'late_deduction'    => round($lateDed, 2),
                'absent_deduction'  => round($absenceDed, 2),
                'loan'              => round($p->loan_deduction, 2),
                'other_adjustments' => abs($other) > 0.01 ? round($other, 2) : 0,
                'net'               => round($p->net_pay, 2),
            ];
        })->sortBy('name')->values();

        return response()->json($rows);
    }

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

        $employees = Users::active()->with('salary')->get();
        $periodFrom = Carbon::parse($request->period_start)->startOfDay();
        $periodTo   = Carbon::parse($request->period_end)->startOfDay()
                        ->min(now('Asia/Manila')->subDay()->startOfDay());

        if ($periodFrom->lte($periodTo)) {
            (new AbsenceService())->sync($periodFrom, $periodTo);
        }
        foreach ($employees as $employee) {
            if (!$employee->salary) {
                continue;
            }

            $result = $salaryService->paycheck(
                $employee->salary->salary_basis,
                $employee->salary->working_days_per_month,
                $employee->salary->working_hours_per_day,
                $employee->id,
                $request->period_start,
                $request->period_end,
             
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
                // one day's pay for each day marked Absent in this period (already inside net_pay)
                'absent_days' => $result['absent_days'],
                'absence_deduction' => round($result['absence_deduction'], 2),
                'loan_deduction' => $loanDeduction,
                'net_pay' => $netPay,
                // overtime Comment
                // 'overtime_pay' => $result['overtime_pay'],
            ];
        }

        return response()->json($preview);
    }
    public function mine()
    {
        $p = Payslip::where('user_id', $this->getUserIdFromToken())
            ->orderByDesc('period_end')
            ->first();

        if (!$p) {
            return response()->json(['message' => 'No payslip yet'], 404);
        }

        $gross = $p->gross_salary / 2;                 // stored monthly, a payslip is half
        // same split as report(): contributions and late are stored monthly, tax and loan as paid
        $sss     = $p->sss / 2;
        $phil    = $p->philhealth / 2;
        $pagibig = $p->pagibig / 2;
        $lateDed = $p->late_deduction / 2;
        // whatever else lowered the pay (e.g. an absence deduction), so the lines add up
        $other   = ($gross - $p->net_pay) - ($sss + $phil + $pagibig + $p->income_tax + $lateDed + $p->loan_deduction);

        return response()->json([
            'period_start' => $p->period_start,
            'period_end'   => $p->period_end,
            'gross'        => round($gross, 2),
            'deductions'   => round($gross - $p->net_pay, 2),
            'net'          => round($p->net_pay, 2),
            'sss'          => round($sss, 2),
            'philhealth'   => round($phil, 2),
            'pagibig'      => round($pagibig, 2),
            'tax'          => round($p->income_tax, 2),
            'late'         => round($lateDed, 2),
            'loan'         => round($p->loan_deduction, 2),
            'other'        => abs($other) > 0.01 ? round($other, 2) : 0,
        ]);
    }
}