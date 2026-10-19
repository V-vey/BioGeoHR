<?php

use App\Models\Attendance;
use App\Models\Holiday;
use App\Models\Users;
use App\Models\Salary;
use App\Service\SalaryService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// 26,000 a month over 26 days = 1,000 a day. Second cutoff of November 2026:
// the 17th is a Tuesday, the 21st a Saturday, the 22nd and 29th are Sundays.
const NOV_CUTOFF = ['2026-11-16', '2026-11-30'];

function payrollEmployee(): Users
{
    $u = Users::create([
        'name' => 'Absence Test', 'email' => 'abs' . uniqid() . '@test.test', 'contact_number' => '0917', 'password' => 'x',
        'department' => 'Academic', 'position' => 'Teacher', 'call_time' => '07:30:00',
        'contract_type' => 'Regular', 'date_of_birth' => '1990-01-01', 'gender' => 'Male',
        'nationality' => 'Filipino', 'address' => 'Tarlac', 'employment_status' => 'Permanent', 'is_active' => true,
    ]);
    Salary::create(['user_id' => $u->id, 'salary_basis' => 26000, 'working_hours_per_day' => 8, 'working_days_per_month' => 26]);

    return $u;
}

function paycheckFor(Users $u): array
{
    return (new SalaryService())->paycheck(26000, 26, 8, $u->id, ...NOV_CUTOFF);
}

function mark(Users $u, string $status, string $date): void
{
    Attendance::create([
        'user_id' => $u->id, 'status' => $status, 'date' => $date,
        'time_in' => $status === 'Absent' ? null : '07:30:00', 'time_out' => $status === 'Absent' ? null : '15:30:00',
    ]);
}

afterEach(fn () => Carbon::setTestNow());

// ---------- absence on a holiday ----------

it('does not deduct an Absent row that falls on a holiday', function () {
    $u = payrollEmployee();
    Holiday::create(['date' => '2026-11-17', 'name' => 'Test holiday']);
    mark($u, 'Absent', '2026-11-17');

    $r = paycheckFor($u);

    expect($r['absent_days'])->toBe(0);
    expect((float) $r['absence_deduction'])->toEqualWithDelta(0, 0.01);
});

it('still deducts one day for an Absent row on a normal day', function () {
    $u = payrollEmployee();
    Holiday::create(['date' => '2026-11-17', 'name' => 'Test holiday']);
    mark($u, 'Absent', '2026-11-17');   // the holiday: free
    mark($u, 'Absent', '2026-11-18');   // a normal Wednesday: one day's pay

    $r = paycheckFor($u);

    expect($r['absent_days'])->toBe(1);
    expect((float) $r['absence_deduction'])->toEqualWithDelta(1000, 0.01);
});

// ---------- the rest day is Sunday ----------

it('pays 130% of the daily wage for work on a Sunday (the rest day is not in the monthly salary)', function () {
    $u = payrollEmployee();
    mark($u, 'On-Time', '2026-11-22');

    $r = paycheckFor($u);

    expect((float) $r['overtime_pay'])->toEqualWithDelta(1300, 0.01);   // 26,000 / 26 = 1,000 a day
});

it('pays nothing extra for work on a Saturday', function () {
    $u = payrollEmployee();
    mark($u, 'On-Time', '2026-11-21');

    $r = paycheckFor($u);

    expect((float) $r['overtime_pay'])->toEqualWithDelta(0, 0.01);
});

it('pays a Sunday holiday as a holiday only, not also as Sunday work', function () {
    $u = payrollEmployee();
    Holiday::create(['date' => '2026-11-29', 'name' => 'Sunday holiday']);
    mark($u, 'On-Time', '2026-11-29');

    $r = paycheckFor($u);

    expect((float) $r['overtime_pay'])->toEqualWithDelta(0, 0.01);
    expect((float) $r['holiday_pay'])->toBeGreaterThan(0);
});

// ---------- the profile's absent count ----------

it('the profile absent count skips Saturdays and Sundays', function () {
    // Mon 19 Oct 2026: the month so far has 13 weekdays (1, 2, 5-9, 12-16, 19) and 3 Sundays + 3 Saturdays
    Carbon::setTestNow(Carbon::parse('2026-10-19 12:00:00', 'Asia/Manila'));
    $hr = Users::create([
        'name' => 'Test HR', 'email' => 'hr@test.test', 'contact_number' => '0917', 'password' => 'x',
        'department' => 'Administrative', 'position' => 'HR Administrator', 'call_time' => '08:00:00',
        'contract_type' => 'Regular', 'date_of_birth' => '1990-01-01', 'gender' => 'Other',
        'nationality' => 'Filipino', 'address' => 'Tarlac', 'employment_status' => 'Permanent', 'is_active' => true,
    ]);
    $u = payrollEmployee();

    $this->actingAs($hr, 'sanctum')->getJson("/api/user/{$u->id}")
        ->assertOk()
        ->assertJsonPath('absent', 13);
});
