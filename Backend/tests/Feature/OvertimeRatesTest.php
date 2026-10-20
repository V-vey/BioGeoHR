<?php

use App\Models\Attendance;
use App\Models\Holiday;
use App\Models\Salary;
use App\Models\Users;
use App\Service\SalaryService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// Overtime is the hours past the 8th, paid at the DOLE overtime rate of the kind of day. Saturday and Sunday are
// the days off. 26,000 a month is 125 an hour; every case here works 08:00-18:00, which is 2 hours of overtime.
// November 2026: Tue 17, Sat 21, Sun 22.

function overtimeEmployee(): Users
{
    $u = Users::create([
        'name' => 'Overtime Test', 'email' => 'o' . uniqid() . '@test.test', 'contact_number' => '0917', 'password' => 'x',
        'department' => 'Academic', 'position' => 'Teacher', 'call_time' => '08:00:00',
        'contract_type' => 'Regular', 'date_of_birth' => '1990-01-01', 'gender' => 'Male',
        'nationality' => 'Filipino', 'address' => 'Tarlac', 'employment_status' => 'Permanent', 'is_active' => true,
    ]);
    Salary::create(['user_id' => $u->id, 'salary_basis' => 26000, 'working_hours_per_day' => 8, 'working_days_per_month' => 26]);

    return $u;
}

it('pays overtime at the DOLE rate for each kind of day', function (string $date, ?string $type, float $multiplier) {
    $u = overtimeEmployee();
    if ($type) Holiday::create(['date' => $date, 'name' => 'Test', 'type' => $type]);
    Attendance::create(['user_id' => $u->id, 'status' => 'On-Time', 'date' => $date, 'time_in' => '08:00:00', 'time_out' => '18:00:00']);

    $pay = (new SalaryService())->overtime($u->id, '2026-11-16', '2026-11-30', 125);

    expect($pay)->toEqualWithDelta(round(2 * 125 * $multiplier, 2), 0.01);
})->with([
    'ordinary weekday: 125%'                      => ['2026-11-17', null,                  1.25],
    'Saturday (a day off): 169%'                  => ['2026-11-21', null,                  1.69],
    'Sunday (a day off): 169%'                    => ['2026-11-22', null,                  1.69],
    'special working day: ordinary 125%'          => ['2026-11-17', 'special_working',     1.25],
    'special non-working day: 169%'               => ['2026-11-17', 'special_non_working', 1.69],
    'regular holiday: 260%'                       => ['2026-11-17', 'regular',             2.60],
    'special non-working day on a Saturday: 195%' => ['2026-11-21', 'special_non_working', 1.95],
    'regular holiday on a Saturday: 338%'         => ['2026-11-21', 'regular',             3.38],
    'special non-working day on a Sunday: 195%'   => ['2026-11-22', 'special_non_working', 1.95],
    'regular holiday on a Sunday: 338%'           => ['2026-11-22', 'regular',             3.38],
]);

it('pays no overtime for a day of 8 hours or less', function () {
    $u = overtimeEmployee();
    Attendance::create(['user_id' => $u->id, 'status' => 'On-Time', 'date' => '2026-11-17', 'time_in' => '08:00:00', 'time_out' => '16:00:00']);

    expect((new SalaryService())->overtime($u->id, '2026-11-16', '2026-11-30', 125))->toBe(0.0);
});
