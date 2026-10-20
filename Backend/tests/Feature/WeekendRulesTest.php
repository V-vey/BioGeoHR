<?php

use App\Models\Attendance;
use App\Models\Holiday;
use App\Models\Location;
use App\Models\Salary;
use App\Models\SystemSetting;
use App\Models\Users;
use App\Service\SalaryService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// The rules agreed with the school: Saturday and Sunday are days off. Work on one earns a plain daily wage (no 130%),
// a check-in on either is never late, and a holiday on either gets the DOLE rest-day rates (150% and 260%).
// November 2026: Tue 17, Sat 21, Sun 22, Mon 23.

afterEach(fn () => Carbon::setTestNow());

function weekendEmployee(): Users
{
    $u = Users::create([
        'name' => 'Weekend Test', 'email' => 'w' . uniqid() . '@test.test', 'contact_number' => '0917', 'password' => 'x',
        'department' => 'Academic', 'position' => 'Teacher', 'call_time' => '07:30:00',
        'contract_type' => 'Regular', 'date_of_birth' => '1990-01-01', 'gender' => 'Male',
        'nationality' => 'Filipino', 'address' => 'Tarlac', 'employment_status' => 'Permanent', 'is_active' => true,
    ]);
    Salary::create(['user_id' => $u->id, 'salary_basis' => 26000, 'working_hours_per_day' => 8, 'working_days_per_month' => 26]);

    return $u;
}

it('pays the right extra for work on a Saturday or Sunday, by holiday type', function (string $date, ?string $type, float $expected) {
    $u = weekendEmployee();
    if ($type) Holiday::create(['date' => $date, 'name' => 'Test', 'type' => $type]);
    Attendance::create(['user_id' => $u->id, 'status' => 'On-Time', 'date' => $date, 'time_in' => '07:30:00', 'time_out' => '15:30:00']);

    $r = (new SalaryService())->paycheck(26000, 26, 8, $u->id, '2026-11-16', '2026-11-30');

    expect((float) $r['additional_pay'])->toEqualWithDelta($expected, 0.01);   // 1,000 a day
})->with([
    'Saturday: one plain daily wage'              => ['2026-11-21', null,                  1000],
    'Sunday: one plain daily wage'                => ['2026-11-22', null,                  1000],
    'special non-working day on a Saturday: 150%' => ['2026-11-21', 'special_non_working', 1500],
    'regular holiday on a Saturday: 260%'         => ['2026-11-21', 'regular',             2600],
    'special non-working day on a Sunday: 150%'   => ['2026-11-22', 'special_non_working', 1500],
    'regular holiday on a Sunday: 260%'           => ['2026-11-22', 'regular',             2600],
    'special working day on a Saturday: plain'    => ['2026-11-21', 'special_working',     1000],
    'a weekday holiday keeps the weekday rates'   => ['2026-11-17', 'regular',             1000],
]);

it('a check-in is never late on a Saturday or a Sunday, but is on a weekday', function () {
    SystemSetting::create();    // grace period 15 minutes
    $location = Location::create(['name' => 'School', 'latitude' => 15.47, 'longitude' => 120.6, 'radius' => 50]);
    $u = weekendEmployee();     // starts 07:30

    foreach ([['2026-11-21', 'On-Time'], ['2026-11-22', 'On-Time'], ['2026-11-23', 'Late']] as [$date, $expected]) {
        Carbon::setTestNow(Carbon::parse("$date 09:00:00", 'Asia/Manila'));   // 1.5 hours after the start time
        $token = $u->createToken('t')->plainTextToken;
        app('auth')->forgetGuards();
        $this->withHeader('Authorization', 'Bearer ' . $token)->postJson('/api/clockIn', ['location_name' => $location->name])->assertCreated();

        expect(Attendance::where('user_id', $u->id)->whereDate('date', $date)->value('status'))->toBe($expected, $date);
    }
});
