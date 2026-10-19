<?php

use App\Models\Attendance;
use App\Models\Loan;
use App\Models\Payslip;
use App\Models\Salary;
use App\Models\Users;
use App\Service\SalaryService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// The first cutoff (1st to 15th) takes the loan; the second (16th to the end) never does.
const FIRST_CUTOFF  = ['2026-11-01', '2026-11-15'];
const SECOND_CUTOFF = ['2026-11-16', '2026-11-30'];

beforeEach(function () {
    $this->hr = Users::create([
        'name' => 'Test HR', 'email' => 'hr@test.test', 'contact_number' => '0917', 'password' => 'x',
        'department' => 'Administrative', 'position' => 'HR Administrator', 'call_time' => '08:00:00',
        'contract_type' => 'Regular', 'date_of_birth' => '1990-01-01', 'gender' => 'Other',
        'nationality' => 'Filipino', 'address' => 'Tarlac', 'employment_status' => 'Permanent', 'is_active' => true,
    ]);
});

function employee(float $salary): Users
{
    $u = Users::create([
        'name' => 'Loan Test', 'email' => 'loan' . uniqid() . '@test.test', 'contact_number' => '0917', 'password' => 'x',
        'department' => 'Academic', 'position' => 'Teacher', 'call_time' => '07:30:00',
        'contract_type' => 'Regular', 'date_of_birth' => '1990-01-01', 'gender' => 'Male',
        'nationality' => 'Filipino', 'address' => 'Tarlac', 'employment_status' => 'Permanent', 'is_active' => true,
    ]);
    Salary::create(['user_id' => $u->id, 'salary_basis' => $salary, 'working_hours_per_day' => 8, 'working_days_per_month' => 26]);

    return $u;
}

function loanFor(Users $u, float $monthly, float $remaining, string $start = '2026-10-01'): Loan
{
    return Loan::create([
        'user_id' => $u->id, 'loan_type' => 'SSS', 'total_amount' => 10000,
        'monthly_deduction' => $monthly, 'remaining_balance' => $remaining, 'start_date' => $start, 'status' => 'Active',
    ]);
}

// the net pay of one cutoff, before any loan, straight from the payroll maths
function netBeforeLoan(Users $u, array $period): float
{
    $s = $u->salary;

    return (new SalaryService())->paycheck($s->salary_basis, $s->working_days_per_month, $s->working_hours_per_day, $u->id, ...$period)['net_pay'];
}

// the preview row and the saved payslip for one employee and period (preview first: it saves nothing)
function previewAndRun($test, Users $u, array $period): array
{
    $body = ['period_start' => $period[0], 'period_end' => $period[1]];

    $preview = collect($test->actingAs($test->hr, 'sanctum')->postJson('/api/payslips/preview', $body)->assertOk()->json())
        ->firstWhere('user_id', $u->id);
    $test->actingAs($test->hr, 'sanctum')->postJson('/api/payslips/run', $body)->assertOk();
    $payslip = Payslip::where('user_id', $u->id)->where('period_start', $period[0])->first();

    return [$preview, $payslip];
}

// ---------- behaviour that must not change ----------

it('1. deducts min(monthly, balance) when net pay covers it', function () {
    $u = employee(26000);
    $loan = loanFor($u, 2000, 5000);
    $net = netBeforeLoan($u, FIRST_CUTOFF);

    [$preview, $payslip] = previewAndRun($this, $u, FIRST_CUTOFF);

    expect((float) $preview['loan_deduction'])->toEqualWithDelta(2000, 0.01);
    expect((float) $payslip->loan_deduction)->toEqualWithDelta(2000, 0.01);
    expect((float) $payslip->net_pay)->toEqualWithDelta($net - 2000, 0.01);
    expect((float) $loan->fresh()->remaining_balance)->toEqualWithDelta(3000, 0.01);
    expect($loan->fresh()->status)->toBe('Active');
});

it('2. deducts only the available net pay (about 1,289 of 2,000), net pay becomes 0, balance drops by the amount taken', function () {
    $u = employee(3421.05);                       // the first cutoff takes the whole month's contributions (421.05): 1,710.53 - 421.05 = 1,289.47
    $loan = loanFor($u, 2000, 6000);
    $net = netBeforeLoan($u, FIRST_CUTOFF);
    expect($net)->toEqualWithDelta(1289.47, 0.01);

    [$preview, $payslip] = previewAndRun($this, $u, FIRST_CUTOFF);

    expect((float) $preview['loan_deduction'])->toEqualWithDelta($net, 0.01);
    expect((float) $payslip->loan_deduction)->toEqualWithDelta($net, 0.01);
    expect((float) $payslip->net_pay)->toEqualWithDelta(0, 0.01);
    expect((float) $loan->fresh()->remaining_balance)->toEqualWithDelta(6000 - $net, 0.01);
    expect($loan->fresh()->status)->toBe('Active');
});

it('3. final payment: deducts the remaining balance, balance 0, loan marked Paid', function () {
    $u = employee(26000);
    $loan = loanFor($u, 2000, 1000);

    [$preview, $payslip] = previewAndRun($this, $u, FIRST_CUTOFF);

    expect((float) $preview['loan_deduction'])->toEqualWithDelta(1000, 0.01);
    expect((float) $payslip->loan_deduction)->toEqualWithDelta(1000, 0.01);
    expect((float) $loan->fresh()->remaining_balance)->toEqualWithDelta(0, 0.01);
    expect($loan->fresh()->status)->toBe('Paid');
});

it('4. a period starting on the 16th takes no loan deduction and leaves the balance alone', function () {
    $u = employee(26000);
    $loan = loanFor($u, 2000, 5000);

    [$preview, $payslip] = previewAndRun($this, $u, SECOND_CUTOFF);

    expect((float) $preview['loan_deduction'])->toEqualWithDelta(0, 0.01);
    expect((float) $payslip->loan_deduction)->toEqualWithDelta(0, 0.01);
    expect((float) $loan->fresh()->remaining_balance)->toEqualWithDelta(5000, 0.01);
    expect($loan->fresh()->status)->toBe('Active');
});

// ---------- the two bugs ----------

it('5. a loan that starts after the period end is deducted by neither the preview nor Run Payroll', function () {
    $u = employee(26000);
    $loan = loanFor($u, 2000, 5000, start: '2026-11-20');     // the cutoff ends on the 15th

    [$preview, $payslip] = previewAndRun($this, $u, FIRST_CUTOFF);

    expect((float) $preview['loan_deduction'])->toEqualWithDelta(0, 0.01);
    expect((float) $payslip->loan_deduction)->toEqualWithDelta(0, 0.01);
    expect((float) $loan->fresh()->remaining_balance)->toEqualWithDelta(5000, 0.01);
    expect($loan->fresh()->status)->toBe('Active');
});

it('6. net pay of 0 or below before the loan: loan deduction 0, balance unchanged, loan still Active', function () {
    $u = employee(5000);
    $loan = loanFor($u, 1000, 5000);
    foreach (range(1, 15) as $day) {                          // 15 absences wipe out the cutoff's pay
        Attendance::create(['user_id' => $u->id, 'status' => 'Absent', 'date' => sprintf('2026-11-%02d', $day)]);
    }
    expect(netBeforeLoan($u, FIRST_CUTOFF))->toBeLessThanOrEqual(0);

    [$preview, $payslip] = previewAndRun($this, $u, FIRST_CUTOFF);

    expect((float) $preview['loan_deduction'])->toEqualWithDelta(0, 0.01);
    expect((float) $payslip->loan_deduction)->toEqualWithDelta(0, 0.01);
    expect((float) $payslip->net_pay)->toEqualWithDelta(0, 0.01);
    expect((float) $loan->fresh()->remaining_balance)->toEqualWithDelta(5000, 0.01);
    expect($loan->fresh()->status)->toBe('Active');
});

// ---------- the preview and Run Payroll must always agree ----------

it('7. the preview and Run Payroll give the same loan deduction in every case above', function () {
    $cases = [
        'covered'        => [26000,   2000, 5000, '2026-10-01', FIRST_CUTOFF],
        'short net pay'  => [3421.05, 2000, 6000, '2026-10-01', FIRST_CUTOFF],
        'final payment'  => [26000,   2000, 1000, '2026-10-01', FIRST_CUTOFF],
        'second cutoff'  => [26000,   2000, 5000, '2026-10-01', SECOND_CUTOFF],
        'starts later'   => [26000,   2000, 5000, '2026-11-20', FIRST_CUTOFF],
    ];

    foreach ($cases as $name => [$salary, $monthly, $balance, $start, $period]) {
        Payslip::query()->delete();
        $u = employee($salary);
        loanFor($u, $monthly, $balance, start: $start);

        [$preview, $payslip] = previewAndRun($this, $u, $period);

        expect((float) $preview['loan_deduction'])->toEqualWithDelta((float) $payslip->loan_deduction, 0.01, $name);
        expect((float) $preview['net_pay'])->toEqualWithDelta((float) $payslip->net_pay, 0.01, $name);
        $u->delete();
    }
});
