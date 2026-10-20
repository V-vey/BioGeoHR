<?php

use App\Models\Loan;
use App\Models\Payslip;
use App\Models\Salary;
use App\Models\SystemSetting;
use App\Models\Users;
use App\Service\SalaryService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// The school allows a loan to be taken from either cutoff, so every loan has a "Deducted in" setting:
// 'first' (the 1st-15th, the default) or 'second' (the 16th to the end of the month).

beforeEach(function () {
    Carbon::setTestNow(Carbon::parse('2026-10-20 10:00:00', 'Asia/Manila'));
    $this->hr = Users::create([
        'name' => 'Test HR', 'email' => 'hr@test.test', 'contact_number' => '0917', 'password' => 'x',
        'department' => 'Administrative', 'position' => 'HR Administrator', 'call_time' => '08:00:00',
        'contract_type' => 'Regular', 'date_of_birth' => '1990-01-01', 'gender' => 'Other',
        'nationality' => 'Filipino', 'address' => 'Tarlac', 'employment_status' => 'Permanent', 'is_active' => true,
    ]);
});

afterEach(fn () => Carbon::setTestNow());

function cutoffEmployee(float $salary): Users
{
    $u = Users::create([
        'name' => 'Cutoff Test', 'email' => 'c' . uniqid() . '@test.test', 'contact_number' => '0917', 'password' => 'x',
        'department' => 'Academic', 'position' => 'Teacher', 'call_time' => '07:30:00',
        'contract_type' => 'Regular', 'date_of_birth' => '1990-01-01', 'gender' => 'Male',
        'nationality' => 'Filipino', 'address' => 'Tarlac', 'employment_status' => 'Permanent', 'is_active' => true,
    ]);
    Salary::create(['user_id' => $u->id, 'salary_basis' => $salary, 'working_hours_per_day' => 8, 'working_days_per_month' => 26]);

    return $u;
}

function cutoffLoan(Users $u, string $cutoff, float $monthly, float $balance, string $type = 'Company'): Loan
{
    return Loan::create([
        'user_id' => $u->id, 'loan_type' => $type, 'total_amount' => 10000, 'monthly_deduction' => $monthly,
        'cutoff' => $cutoff, 'remaining_balance' => $balance, 'start_date' => '2026-10-01', 'status' => 'Active',
    ]);
}

function runPayroll($test, string $start, string $end): void
{
    $test->actingAs($test->hr, 'sanctum')->postJson('/api/payslips/run', ['period_start' => $start, 'period_end' => $end])->assertOk();
}

function takenIn(Users $u, string $start): float
{
    return round((float) Payslip::where('user_id', $u->id)->where('period_start', $start)->value('loan_deduction'), 2);
}

it('a loan taken in the 16th-end cutoff comes out there, and nothing in the 1st-15th', function () {
    $u = cutoffEmployee(20000);
    $loan = cutoffLoan($u, 'second', 2000, 10000);

    runPayroll($this, '2026-11-01', '2026-11-15');
    expect(takenIn($u, '2026-11-01'))->toBe(0.0);
    expect((float) $loan->fresh()->remaining_balance)->toBe(10000.0);

    runPayroll($this, '2026-11-16', '2026-11-30');
    expect(takenIn($u, '2026-11-16'))->toBe(2000.0);
    expect((float) $loan->fresh()->remaining_balance)->toBe(8000.0);
});

it('a loan with the default cutoff still comes out of the 1st-15th, as before', function () {
    $u = cutoffEmployee(20000);
    $loan = cutoffLoan($u, 'first', 2000, 10000);

    runPayroll($this, '2026-11-01', '2026-11-15');
    runPayroll($this, '2026-11-16', '2026-11-30');

    expect(takenIn($u, '2026-11-01'))->toBe(2000.0);
    expect(takenIn($u, '2026-11-16'))->toBe(0.0);
    expect((float) $loan->fresh()->remaining_balance)->toBe(8000.0);
});

it('an SSS loan short of pay in the 16th-end cutoff has its unpaid part collected at the next cutoff', function () {
    $u = cutoffEmployee(3888.89);                    // about 1,944 left after tax in the 16th-end cutoff, no contributions
    $loan = cutoffLoan($u, 'second', 2000, 6000, 'SSS');
    $net = (new SalaryService())->cutoffNetPay(3888.89, 'second');

    runPayroll($this, '2026-11-16', '2026-11-30');
    $taken = takenIn($u, '2026-11-16');
    expect($taken)->toEqualWithDelta($net, 0.02);
    expect((float) $loan->fresh()->unpaid_amount)->toEqualWithDelta(2000 - $taken, 0.02);

    runPayroll($this, '2026-12-01', '2026-12-15');   // the other cutoff, the next one: only the unpaid part
    expect(takenIn($u, '2026-12-01'))->toEqualWithDelta(2000 - $taken, 0.02);
    expect((float) $loan->fresh()->unpaid_amount)->toBe(0.0);
    expect((float) $loan->fresh()->remaining_balance)->toEqualWithDelta(4000, 0.02);   // the full 2,000 has now been paid
});

it('affordability is judged for the cutoff that takes the loan', function () {
    $u = cutoffEmployee(20000);                      // the 1st-15th pays 8,000 (after contributions), the 16th-end 10,000
    $post = fn (string $cutoff, float $monthly) => $this->actingAs($this->hr, 'sanctum')->postJson('/api/loans', [
        'user_id' => $u->id, 'loan_type' => 'SSS', 'total_amount' => 50000, 'monthly_deduction' => $monthly,
        'start_date' => '2026-10-21', 'cutoff' => $cutoff,
    ]);

    $post('first', 9000)->assertStatus(422);         // more than the 1st-15th pays
    $post('second', 9000)->assertCreated();          // fits the 16th-end
    $post('first', 8000)->assertCreated();           // a different cutoff: not added to the 9,000
    $post('first', 1)->assertStatus(422);            // the 1st-15th is full now
});

it('the cutoff is saved, defaults to the 1st-15th, must be valid, and can be changed', function () {
    $u = cutoffEmployee(20000);
    $body = ['user_id' => $u->id, 'loan_type' => 'SSS', 'total_amount' => 5000, 'monthly_deduction' => 1000, 'start_date' => '2026-10-21'];

    $this->actingAs($this->hr, 'sanctum')->postJson('/api/loans', $body + ['cutoff' => 'third'])->assertUnprocessable()->assertJsonValidationErrors(['cutoff']);

    $made = $this->actingAs($this->hr, 'sanctum')->postJson('/api/loans', $body)->assertCreated()->assertJsonPath('cutoff', 'first');
    $id = $made->json('id');

    $this->actingAs($this->hr, 'sanctum')->putJson("/api/loans/{$id}", ['cutoff' => 'second'])->assertOk()->assertJsonPath('cutoff', 'second');
    expect(Loan::find($id)->cutoff)->toBe('second');
});

it('the school-year check counts from the cutoff that takes the loan', function () {
    SystemSetting::create(['school_year_start' => '2026-06-01', 'school_year_end' => '2027-03-31']);
    $u = cutoffEmployee(20000);
    $post = fn (string $cutoff) => $this->actingAs($this->hr, 'sanctum')->postJson('/api/loans', [
        'user_id' => $u->id, 'loan_type' => 'Company', 'total_amount' => 8000, 'monthly_deduction' => 2000,   // 4 deductions
        'start_date' => '2026-12-20', 'cutoff' => $cutoff,
    ]);

    // a 1st-15th loan starting on the 20th first comes out in January (Jan, Feb, Mar = 3): too few for 4
    $post('first')->assertStatus(422);
    // a 16th-end loan comes out already in December (Dec, Jan, Feb, Mar = 4): fits
    $post('second')->assertCreated();
});

// ---------- 'both': half of the monthly deduction in each cutoff ----------

it('a loan set to both cutoffs takes half in each, and the month adds up exactly', function () {
    $u = cutoffEmployee(20000);
    $loan = cutoffLoan($u, 'both', 2000, 10000);

    runPayroll($this, '2026-11-01', '2026-11-15');
    expect(takenIn($u, '2026-11-01'))->toBe(1000.0);
    runPayroll($this, '2026-11-16', '2026-11-30');
    expect(takenIn($u, '2026-11-16'))->toBe(1000.0);
    expect((float) $loan->fresh()->remaining_balance)->toBe(8000.0);

    // an amount that does not halve evenly: the second half takes the odd cent, so nothing is lost
    expect(Loan::shareOf(1000.01, 'both', 'first') + Loan::shareOf(1000.01, 'both', 'second'))->toEqualWithDelta(1000.01, 0.0001);
    expect(Loan::shareOf(1000.01, 'both', 'first'))->toBe(500.01);
    expect(Loan::shareOf(1000.01, 'both', 'second'))->toBe(500.0);
});

it('a loan set to both cutoffs is created, and each cutoff is checked for the half it takes', function () {
    $u = cutoffEmployee(20000);                      // the 1st-15th pays 8,000, the 16th-end 10,000
    $post = fn (string $cutoff, float $monthly, float $total) => $this->actingAs($this->hr, 'sanctum')->postJson('/api/loans', [
        'user_id' => $u->id, 'loan_type' => 'SSS', 'total_amount' => $total, 'monthly_deduction' => $monthly,
        'start_date' => '2026-10-21', 'cutoff' => $cutoff,
    ]);

    $post('both', 16002, 90000)->assertStatus(422)->assertJsonPath('message', fn ($m) => str_contains($m, 'Lower this deduction to ₱16,000.00'));
    $post('both', 16000, 90000)->assertCreated()->assertJsonPath('cutoff', 'both');   // 8,000 + 8,000 fit
    $post('second', 2000, 20000)->assertCreated();   // the 16th-end has 10,000 - 8,000 = 2,000 left
    $post('second', 1, 36)->assertStatus(422);       // and now it is full (36 deductions of 1 is within the length limit)
});

it('a loan set to both cutoffs follows the same school-year start rule as a 1st-15th loan', function () {
    SystemSetting::create(['school_year_start' => '2026-06-01', 'school_year_end' => '2027-03-31']);
    $u = cutoffEmployee(20000);

    // starting on the 20th, its first deduction is counted from January (Jan, Feb, Mar = 3): too few for 4
    $this->actingAs($this->hr, 'sanctum')->postJson('/api/loans', [
        'user_id' => $u->id, 'loan_type' => 'Company', 'total_amount' => 8000, 'monthly_deduction' => 2000,
        'start_date' => '2026-12-20', 'cutoff' => 'both',
    ])->assertStatus(422);
});
