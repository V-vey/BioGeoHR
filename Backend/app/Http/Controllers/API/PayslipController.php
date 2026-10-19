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
    /**
     * Payslips, never the whole table. Pick them with
     *   ?period_start=2026-09-16&period_end=2026-09-30     one pay period (all employees)
     *   ?user_id=5&year=2026                                one employee's year (for the year-to-date)
     * With no filter at all, only the newest period is returned.
     */
    public function index(Request $request)
    {
        $request->validate([
            'period_start' => 'required_with:period_end|date',
            'period_end'   => 'required_with:period_start|date',
            'user_id'      => 'sometimes|integer',
            'year'         => 'sometimes|integer|min:2000|max:2100',
        ]);

        $query = Payslip::with('user');

        if ($request->filled('period_start')) {
            $query->where('period_start', Carbon::parse($request->period_start)->toDateString())
                  ->where('period_end', Carbon::parse($request->period_end)->toDateString());
        }
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }
        if ($request->filled('year')) {
            $query->whereYear('period_end', $request->year);
        }

        // nothing chosen: the newest period only, so a bare request can never dump every payslip
        if (!$request->filled('period_start') && !$request->filled('user_id') && !$request->filled('year')) {
            $latest = Payslip::orderByDesc('period_start')->first(['period_start', 'period_end']);
            if (!$latest) {
                return response()->json([]);
            }
            $query->where('period_start', $latest->period_start)->where('period_end', $latest->period_end);
        }

        return response()->json($query->orderBy('period_start')->get());
    }

    /**
     * One line per pay period with its totals, newest first: what the pages need to list the
     * periods and to show the overview, without loading every payslip.
     */
    public function periods()
    {
        $rows = Payslip::query()
            ->selectRaw('period_start, period_end, COUNT(*) as count,
                SUM(net_pay) as total_net_pay,
                SUM(sss + philhealth + pagibig) as statutory,
                SUM(income_tax) as income_tax,
                SUM(loan_deduction) as loan_deductions')
            ->groupBy('period_start', 'period_end')
            ->orderByDesc('period_start')
            ->get()
            ->map(fn ($r) => [
                'period_start'    => substr((string) $r->period_start, 0, 10),
                'period_end'      => substr((string) $r->period_end, 0, 10),
                'count'           => (int) $r->count,
                'total_net_pay'   => round((float) $r->total_net_pay, 2),
                'statutory'       => round((float) $r->statutory, 2),
                'income_tax'      => round((float) $r->income_tax, 2),
                'loan_deductions' => round((float) $r->loan_deductions, 2),
            ]);

        return response()->json($rows);
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

        if ($problem = $this->badCutoff($request)) {
            return response()->json(['message' => $problem], 422);
        }

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
            );

            // $loan = Loan::dueIn($employee->id, $request->period_start, $request->period_end);
            // $loanDeduction = $loan ? $loan->deductionFor($result['net_pay']) : 0;
            // $netPay = max(0, $result['net_pay'] - $loanDeduction);

            // if ($loan && $loanDeduction > 0) {
            //     $loan->decrement('remaining_balance', $loanDeduction);
            //     if ($loan->fresh()->remaining_balance <= 0) {
            //         $loan->status = 'Paid';
            //         $loan->paid_off_period_start = $request->period_start;
            //         $loan->paid_off_period_end = $request->period_end;
            //         $loan->save();
            //     }
            // }

            $plan = Loan::planFor($employee->id, $request->period_start, $request->period_end, $result['net_pay']);
            $loanDeduction = $plan['total'];
            $netPay = max(0, $result['net_pay'] - $loanDeduction);

            foreach ($plan['lines'] as $line) {
                $loan = $line['loan'];
                $loan->remaining_balance = round($loan->remaining_balance - $line['taken'], 2);
                $loan->unpaid_amount = $line['unpaid'];
                if ($loan->remaining_balance <= 0) {
                    $loan->status = 'Paid';
                    $loan->unpaid_amount = 0;
                    $loan->paid_off_period_start = $request->period_start;
                    $loan->paid_off_period_end = $request->period_end;
                }
                $loan->save();
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
                'overtime_pay' => $result['overtime_pay'],
                'additional_pay' => $result['additional_pay'],
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
        // each day's hours with its sessions added up (see Attendance::workedSecondsSql)
        $seconds = Attendance::whereBetween('date', [$from, $to])
            ->selectRaw('user_id, SUM(' . Attendance::workedSecondsSql() . ') as secs')
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
      
            // pay added on top of the salary: overtime_pay (hours past 8) and additional_pay (rest day and holiday work)
            $extra   = $p->overtime_pay + $p->additional_pay;
            $other   = ($gross + $extra - $p->net_pay) - ($gov + $p->income_tax + $lateDed + $p->loan_deduction);

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
                // pay added on top of the salary (the net pay includes both)
                'overtime_pay'      => round($p->overtime_pay, 2),
                'additional_pay'    => round($p->additional_pay, 2),
                'government'        => round($gov, 2),
                // the same half-month amount, shown one contribution at a time
                'sss'               => round($p->sss / 2, 2),
                'philhealth'        => round($p->philhealth / 2, 2),
                'pagibig'           => round($p->pagibig / 2, 2),
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
        if ($problem = $this->badCutoff($request)) {
            return response()->json(['message' => $problem], 422);
        }

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
            
            );

            // $loan = Loan::dueIn($employee->id, $request->period_start, $request->period_end);
            // $loanDeduction = $loan ? $loan->deductionFor($result['net_pay']) : 0;
            // $netPay = max(0, $result['net_pay'] - $loanDeduction);
            $loanDeduction = Loan::planFor($employee->id, $request->period_start, $request->period_end, $result['net_pay'])['total'];
            $netPay = max(0, $result['net_pay'] - $loanDeduction);
            
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
                'overtime_pay' => $result['overtime_pay'],
                'additional_pay' => $result['additional_pay'],
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
        // pay added on top of the salary: overtime_pay (hours past 8) and additional_pay (rest day and holiday work)
        $extra   = $p->overtime_pay + $p->additional_pay;
        $other   = ($gross + $extra - $p->net_pay) - ($sss + $phil + $pagibig + $p->income_tax + $lateDed + $p->loan_deduction);

        return response()->json([
            'period_start' => $p->period_start,
            'period_end'   => $p->period_end,
            'gross'        => round($gross, 2),
            'overtime'     => round($p->overtime_pay, 2),
            'additional'   => round($p->additional_pay, 2),
            'deductions'   => round($gross + $extra - $p->net_pay, 2),
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

    /**
     * The school pays two cutoffs a month: the 1st to the 15th, and the 16th to the end of the month.
     * Contributions, loans and the payday all depend on which one it is, so nothing else is accepted.
     * Returns the message to show, or null when the period is one of the two.
     */
    private function badCutoff(Request $request): ?string
    {
        $start = Carbon::parse($request->period_start);
        $end = Carbon::parse($request->period_end);

        $expectedEnd = match ($start->day) {
            1  => $start->copy()->day(15),
            16 => $start->copy()->endOfMonth(),
            default => null,
        };

        if (!$expectedEnd || $end->toDateString() !== $expectedEnd->toDateString()) {
            return 'A pay period is the 1st to the 15th, or the 16th to the end of the month.';
        }

        return null;
    }

}