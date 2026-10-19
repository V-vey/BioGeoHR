<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Loan;
use App\Models\Users;
use App\Models\AuditLog;
use App\Models\Salary;
use App\Service\SalaryService;
use App\Models\SystemSetting;
use Carbon\Carbon;

class LoanController extends Controller
{
    /**
         * A loan is only accepted when the employee's pay can cover it. Every active loan comes out of the first
         * cutoff (the 1st-15th), so they have to fit together within what that cutoff pays after contributions and tax.
         * $ignoreLoanId is the loan being edited, so it is not counted twice. Returns the message to show, or null if fine.
    */
    private function unaffordable(int|string $userId, float $monthlyDeduction, ?int $ignoreLoanId = null): ?string
    {
        $salary = Salary::where('user_id', $userId)->orderByDesc('id')->first();
        if (!$salary || !$salary->salary_basis) {
            return 'This employee has no salary record yet. Set the salary before adding a loan.';
        }

        $others = (float) Loan::where('user_id', $userId)
            ->where('status', 'Active')
            ->when($ignoreLoanId, fn ($q) => $q->where('id', '!=', $ignoreLoanId))
            ->sum('monthly_deduction');
        $total = $monthlyDeduction + $others;

        $max = (new SalaryService())->cutoffNetPay($salary->salary_basis);
        if (round($total, 2) > $max) {
            $limit = number_format(max(0, $max - $others), 2);
            return 'This employee\'s loans would take ₱' . number_format($total, 2)
                . " from one cutoff, but one cutoff pays only ₱" . number_format($max, 2)
                . ' after contributions and tax. Lower this deduction to ₱' . $limit . ' or less.';
        }

        return null;
    }

    private const MAX_DEDUCTIONS = 36;   // the most monthly deductions any loan may take

    /** A loan, of any type, may not drag on for years: at most MAX_DEDUCTIONS deductions. */
    private function tooLong(float $amount, float $monthly): ?string
    {
        if ($monthly <= 0) return null;
        $needed = (int) ceil(round($amount / $monthly, 6));
        if ($needed <= self::MAX_DEDUCTIONS) return null;

        $min = number_format(ceil($amount / self::MAX_DEDUCTIONS * 100) / 100, 2);
        return "This loan needs {$needed} deductions, but the most allowed is " . self::MAX_DEDUCTIONS
            . ". Raise the monthly deduction to ₱{$min} or more.";
    }

    private function pastSchoolYear(string $type, float $total, float $monthly, string $startDate): ?string
    {
        if (!in_array($type, ['Company', 'Cash Advance'], true)) return null;

        $end = SystemSetting::first()?->school_year_end;
        if (!$end) return null;                                  // no school year set: no check
        $end = Carbon::parse($end)->endOfDay();

        $start = Carbon::parse($startDate);
        // the first deduction is in the 1st-15th cutoff that ends on or after the start date
        $firstMonth = ($start->day <= 15 ? $start->copy() : $start->copy()->addMonthNoOverflow())->startOfMonth();

        $available = $firstMonth->gt($end) ? 0
            : (int) $firstMonth->diffInMonths($end->copy()->startOfMonth()) + 1;   // deductions that fit before it ends
        $needed = (int) ceil(round($total / $monthly, 6));

        if ($needed <= $available) return null;

        $endText = $end->format('M j, Y');
        if ($available === 0) {
            return "The first deduction would fall after the school year ends ({$endText}), so this loan cannot be repaid in the school year.";
        }
        $min = number_format(ceil($total / $available * 100) / 100, 2);
        return "At ₱" . number_format($monthly, 2) . " a month this loan needs {$needed} deductions, but only {$available} fit before the school year ends ({$endText}). "
            . "Raise the monthly deduction to ₱{$min} or more.";
    }

    /**
     * The Loans page, one page at a time:   ?page=1&per_page=10&search=maria
     * Active loans come first, then the newest. `stats` counts ALL loans (not just this page or search),
     * for the cards at the top of the Loans and Payroll pages.
     */
    public function index(Request $request)
    {
        $request->validate([
            'search'   => 'sometimes|nullable|string|max:100',
            'page'     => 'sometimes|integer|min:1',
            'per_page' => 'sometimes|integer|min:1|max:50',
        ]);

        $query = Loan::with('user:id,name,department,position,image_path')
            ->orderByRaw("status = 'Active' desc")
            ->orderByDesc('id');
        if ($term = trim((string) $request->input('search'))) {
            // % and _ typed by the user must not act as wildcards
            $like = '%' . addcslashes($term, '%_\\') . '%';
            $query->whereHas('user', fn ($q) => $q->where('name', 'like', $like));
        }
        $page = $query->paginate((int) $request->input('per_page', 10));

        return response()->json([
            'data'         => $page->items(),
            'current_page' => $page->currentPage(),
            'last_page'    => $page->lastPage(),
            'per_page'     => $page->perPage(),
            'total'        => $page->total(),
            'stats'        => [
                'active'      => Loan::where('status', 'Active')->count(),
                'paid'        => Loan::where('status', 'Paid')->count(),
                'outstanding' => (float) Loan::where('status', 'Active')->sum('remaining_balance'),
            ],
        ]);
    }
    public function store(Request $request)
    {

        $request->validate([
            'user_id'           => 'required|exists:users,id',
            'loan_type'         => 'required|in:SSS,Pag-IBIG,Company,Cash Advance',
            'total_amount'      => 'required|numeric|gt:0',
            'monthly_deduction' => 'required|numeric|gt:0|lte:total_amount',   // never more than the loan
            'start_date' => 'required|date|after_or_equal:today|before_or_equal:' . now()->addYear()->toDateString(),
        ], [
            // 'total_amount.max' => 'The loan amount cannot be more than ₱10,000.00.',
            'monthly_deduction.lte' => 'The monthly deduction cannot be more than the loan amount.',
        ]);
        if (in_array($request->loan_type, ['Company', 'Cash Advance'], true) && $request->total_amount > 10000) {
            return response()->json(['message' => 'A company loan or cash advance cannot be more than ₱10,000.00.'], 422);
        }

        // $hasActiveLoan = Loan::where('user_id', $request->user_id)
        //     ->where('status', 'Active')
        //     ->exists();

        // if ($hasActiveLoan) {
        //     return response()->json(['message' => 'Employee already has an active loan'], 422);
        // }
        // the school: one active loan at a time applies only to company loans; SSS and Pag-IBIG loans can coexist
        if ($request->loan_type === 'Company') {
            $hasActiveCompanyLoan = Loan::where('user_id', $request->user_id)
                ->where('loan_type', 'Company')
                ->where('status', 'Active')
                ->exists();

            if ($hasActiveCompanyLoan) {
                return response()->json(['message' => 'Employee already has an active company loan'], 422);
            }
        }
        if ($problem = $this->unaffordable($request->user_id, (float) $request->monthly_deduction)) {
            return response()->json(['message' => $problem], 422);
        }
        if ($problem = $this->pastSchoolYear($request->loan_type, (float) $request->total_amount, (float) $request->monthly_deduction, $request->start_date)) {
            return response()->json(['message' => $problem], 422);
        }
        if ($problem = $this->tooLong((float) $request->total_amount, (float) $request->monthly_deduction)) {
            return response()->json(['message' => $problem], 422);
        }

        $loan = Loan::create([
            'user_id' => $request->user_id,
            'loan_type' => $request->loan_type,
            'total_amount' => $request->total_amount,
            'monthly_deduction' => $request->monthly_deduction,
            'remaining_balance' => $request->total_amount,
            'start_date' => $request->start_date,
            'status' => 'Active',
        ]);
        AuditLog::record('admin', 'loan_created', 'success', "User {$loan->user_id}");
        return response()->json($loan, 201);
    }

    public function show(string $id)
    {
        $loan = Loan::find($id);
        if (!$loan) {
            return response()->json(['message' => 'Loan not found'], 404);
        }
        return response()->json($loan);
    }

    public function update(Request $request, string $id)
    {
        $loan = Loan::find($id);
        if (!$loan) {
            return response()->json(['message' => 'Loan not found'], 404);
        }

        $data = $request->validate([
            'loan_type'         => 'sometimes|in:SSS,Pag-IBIG,Company,Cash Advance',
            'total_amount'      => 'sometimes|numeric|gt:0',
            'monthly_deduction' => 'sometimes|numeric|gt:0',
            'start_date'        => 'sometimes|date|after_or_equal:2020-01-01|before_or_equal:' . now()->addYear()->toDateString(),
        ]);


        $total = $data['total_amount'] ?? $loan->total_amount;
        $type = $data['loan_type'] ?? $loan->loan_type;
        if (in_array($type, ['Company', 'Cash Advance'], true) && $total > 10000) {
            return response()->json(['message' => 'A company loan or cash advance cannot be more than ₱10,000.00.'], 422);
        }

        if (($data['monthly_deduction'] ?? $loan->monthly_deduction) > $total ) {
            return response()->json(['message' => 'The monthly deduction cannot be more than the loan amount.'], 422);
        }

        // only when the deduction itself is being changed, so other edits to an older loan still work
        if (isset($data['monthly_deduction'])
            && ($problem = $this->unaffordable($loan->user_id, (float) $data['monthly_deduction'], $loan->id))) {
            return response()->json(['message' => $problem], 422);
        }

        if (isset($data['total_amount'])) {
            $data['remaining_balance'] = max(0, $loan->remaining_balance + ($data['total_amount'] - $loan->total_amount));
        }

        // an edit that changes the repayment plan must still finish within the school year. A loan already
        // running is judged on what is left to pay, counted from today (or its start date, if later).
        if (isset($data['total_amount']) || isset($data['monthly_deduction']) || isset($data['start_date']) || isset($data['loan_type'])) {
            $startsOn = Carbon::parse($data['start_date'] ?? $loan->start_date);
            if ($startsOn->lt(today())) $startsOn = today();
            if ($problem = $this->pastSchoolYear(
                $data['loan_type'] ?? $loan->loan_type,
                (float) ($data['remaining_balance'] ?? $loan->remaining_balance),
                (float) ($data['monthly_deduction'] ?? $loan->monthly_deduction),
                $startsOn->toDateString(),
            )) {
                return response()->json(['message' => $problem], 422);
            }
            if ($problem = $this->tooLong(
                (float) ($data['remaining_balance'] ?? $loan->remaining_balance),
                (float) ($data['monthly_deduction'] ?? $loan->monthly_deduction),
            )) {
                return response()->json(['message' => $problem], 422);
            }
        }

        $loan->update($data);

        return response()->json($loan);
    }

    public function destroy(string $id)
    {
        $loan = Loan::find($id);
        if (!$loan) {
            return response()->json(['message' => 'Loan not found'], 404);
        }
        $loan->delete();
        return response()->json(['message' => 'Loan deleted successfully']);
    }


    
    // Apply one deduction cycle to a loan (called during payroll processing).
     
    public function deduct(string $id)
    {
        $loan = Loan::find($id);
        if (!$loan || $loan->status !== 'Active') {
            return response()->json(['message' => 'No active loan found'], 404);
        }

        $amount = min($loan->monthly_deduction, $loan->remaining_balance);
        $loan->decrement('remaining_balance', $amount);

        if ($loan->fresh()->remaining_balance <= 0) {
            $loan->status = 'Paid';
            $loan->save();
        }

        return response()->json([
            'deducted' => $amount,
            'remaining_balance' => $loan->fresh()->remaining_balance,
            'status' => $loan->fresh()->status,
        ]);
    }

    // For mobile view
    public function myLoans()
    {
        $userId = $this->getUserIdFromToken();
        $loans = Loan::where('user_id', $userId)->get();
        return response()->json($loans);
    }
    
    public function paidOffThisPeriod(Request $request)
    {
        $request->validate([
            'period_start' => 'required|date',
            'period_end' => 'required|date',
        ]);
        $count = Loan::where('status', 'Paid')
            ->where('paid_off_period_start', $request->period_start)
            ->where('paid_off_period_end', $request->period_end)
            ->count();
        return response()->json(['count' => $count]);
    }
}
