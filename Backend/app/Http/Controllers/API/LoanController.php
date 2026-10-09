<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Loan;
use App\Models\Users;
use App\Models\AuditLog;

class LoanController extends Controller
{
    public function index()
    {
        $loans = Loan::with('user:id,name,department,position,image_path')->get();
        return response()->json($loans);
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
        'monthly_deduction.lte' => 'The monthly deduction cannot be more than the loan amount.',
    ]);

        $hasActiveLoan = Loan::where('user_id', $request->user_id)
            ->where('status', 'Active')
            ->exists();

        if ($hasActiveLoan) {
            return response()->json(['message' => 'Employee already has an active loan'], 422);
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
        if (($data['monthly_deduction'] ?? $loan->monthly_deduction) > $total) {
            return response()->json(['message' => 'The monthly deduction cannot be more than the loan amount.'], 422);
        }

        if (isset($data['total_amount'])) {
            $data['remaining_balance'] = max(0, $loan->remaining_balance + ($data['total_amount'] - $loan->total_amount));
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
