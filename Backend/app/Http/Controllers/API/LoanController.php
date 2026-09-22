<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Loan;
use App\Models\Users;

class LoanController extends Controller
{
    public function index()
    {
        $loans = Loan::all();
        return response()->json($loans);
    }
    public function store(Request $request)
    {

        $request->validate([
            'user_id' => 'required',
            'loan_type' => 'required|in:SSS,Pag-IBIG,Company,Cash Advance',
            'total_amount' => 'required|numeric|min:0',
            'monthly_deduction' => 'required|numeric|min:0',
            'start_date' => 'required|date'
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

        $loan->update($request->only([
            'loan_type', 'total_amount', 'monthly_deduction', 'start_date',
        ]));

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
}
