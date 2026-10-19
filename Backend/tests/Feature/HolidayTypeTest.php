<?php

use App\Models\Attendance;
use App\Models\AuditLog;
use App\Models\Holiday;
use App\Models\Location;
use App\Models\Salary;
use App\Models\SystemSetting;
use App\Models\Users;
use App\Service\SalaryService;
use App\Service\AbsenceService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// 26,000 a month over 26 days = 1,000 a day. Second cutoff of November 2026:
// Tue 17th, Wed 18th, Sat 21st, Sun 22nd, Sun 29th.
const HOL_CUTOFF = ['2026-11-16', '2026-11-30'];

function holEmployee(): Users
{
    $u = Users::create([
        'name' => 'Holiday Test', 'email' => 'hol' . uniqid() . '@test.test', 'contact_number' => '0917', 'password' => 'x',
        'department' => 'Academic', 'position' => 'Teacher', 'call_time' => '07:30:00',
        'contract_type' => 'Regular', 'date_of_birth' => '1990-01-01', 'gender' => 'Male',
        'nationality' => 'Filipino', 'address' => 'Tarlac', 'employment_status' => 'Permanent', 'is_active' => true,
    ]);
    Salary::create(['user_id' => $u->id, 'salary_basis' => 26000, 'working_hours_per_day' => 8, 'working_days_per_month' => 26]);

    return $u;
}

function holiday(string $date, string $type): void
{
    Holiday::create(['date' => $date, 'name' => 'Test ' . $type, 'type' => $type]);
}

function worked(Users $u, string $date, string $status = 'On-Time'): void
{
    Attendance::create(['user_id' => $u->id, 'status' => $status, 'date' => $date, 'time_in' => '07:30:00', 'time_out' => '15:30:00']);
}

function pay(Users $u): array
{
    return (new SalaryService())->paycheck(26000, 26, 8, $u->id, ...HOL_CUTOFF);
}

function holidayHr(): Users
{
    return Users::create([
        'name' => 'Test HR', 'email' => 'hr@test.test', 'contact_number' => '0917', 'password' => 'x',
        'department' => 'Administrative', 'position' => 'HR Administrator', 'call_time' => '08:00:00',
        'contract_type' => 'Regular', 'date_of_birth' => '1990-01-01', 'gender' => 'Other',
        'nationality' => 'Filipino', 'address' => 'Tarlac', 'employment_status' => 'Permanent', 'is_active' => true,
    ]);
}

afterEach(fn () => Carbon::setTestNow());

// ---------- pay for a worked day, by day type (extra on top of the monthly salary) ----------

it('pays the DOLE rate for each kind of worked day', function (string $date, ?string $type, float $holidayPay, float $restDayPay) {
    $u = holEmployee();
    if ($type) holiday($date, $type);
    worked($u, $date);

    $r = pay($u);

    expect((float) $r['holiday_pay'])->toEqualWithDelta($holidayPay, 0.01);
    expect((float) $r['overtime_pay'])->toEqualWithDelta($restDayPay, 0.01);   // "Additional Pay": Sunday work
})->with([
    'ordinary weekday'                        => ['2026-11-17', null,                  0,    0],
    'Saturday (a non-working day, no extra)'  => ['2026-11-21', null,                  0,    0],
    'rest day (Sunday): 130%'                 => ['2026-11-22', null,                  0,    1300],
    'regular holiday: 200% = +100%'           => ['2026-11-17', 'regular',             1000, 0],
    'special non-working day: 130% = +30%'    => ['2026-11-17', 'special_non_working', 300,  0],
    'special working day: ordinary'           => ['2026-11-17', 'special_working',     0,    0],
    'regular holiday on a rest day: 260%'     => ['2026-11-29', 'regular',             2600, 0],
    'special day on a rest day: 150%'         => ['2026-11-29', 'special_non_working', 1500, 0],
    'special working day on a rest day: 130%' => ['2026-11-29', 'special_working',     0,    1300],
]);

it('a holiday that is not worked adds nothing and deducts nothing', function (string $type) {
    $u = holEmployee();
    holiday('2026-11-17', $type);

    $r = pay($u);

    expect((float) $r['holiday_pay'])->toEqualWithDelta(0, 0.01);
    expect((float) $r['absence_deduction'])->toEqualWithDelta(0, 0.01);
})->with(['regular', 'special_non_working']);

it('workedDayExtra gives the same numbers directly', function () {
    expect(SalaryService::workedDayExtra(false, null))->toBe(0.0);
    expect(SalaryService::workedDayExtra(true, null))->toBe(1.3);
    expect(SalaryService::workedDayExtra(false, 'regular'))->toBe(1.0);
    expect(SalaryService::workedDayExtra(false, 'special_non_working'))->toEqualWithDelta(0.3, 0.0001);
    expect(SalaryService::workedDayExtra(true, 'special_non_working'))->toBe(1.5);
    expect(SalaryService::workedDayExtra(true, 'regular'))->toBe(2.6);
    expect(SalaryService::workedDayExtra(false, 'special_working'))->toBe(0.0);
});

// ---------- a special working day is an ordinary workday ----------

it('an Absent row on a special working day is deducted, on a special non-working day it is not', function () {
    $u = holEmployee();
    holiday('2026-11-17', 'special_working');
    holiday('2026-11-18', 'special_non_working');
    Attendance::create(['user_id' => $u->id, 'status' => 'Absent', 'date' => '2026-11-17']);
    Attendance::create(['user_id' => $u->id, 'status' => 'Absent', 'date' => '2026-11-18']);

    $r = pay($u);

    expect($r['absent_days'])->toBe(1);
    expect((float) $r['absence_deduction'])->toEqualWithDelta(1000, 0.01);
});

it('absences are created for a special working day but not for a regular or special non-working one', function () {
    Carbon::setTestNow(Carbon::parse('2026-11-30 12:00:00', 'Asia/Manila'));
    $u = holEmployee();
    $u->forceFill(['created_at' => '2026-11-01 00:00:00'])->save();
    holiday('2026-11-17', 'special_working');
    holiday('2026-11-18', 'special_non_working');
    holiday('2026-11-19', 'regular');

    (new AbsenceService())->sync(Carbon::parse('2026-11-17'), Carbon::parse('2026-11-19'));

    $dates = Attendance::where('user_id', $u->id)->pluck('date')->map(fn ($d) => substr((string) $d, 0, 10))->all();
    expect($dates)->toBe(['2026-11-17']);
});

it('a late clock-in is Late on a special working day, and On-Time on a regular or special non-working day', function () {
    SystemSetting::create();    // grace period 15 minutes
    $location = Location::create(['name' => 'School', 'latitude' => 15.47, 'longitude' => 120.6, 'radius' => 50]);
    $u = holEmployee();         // starts 07:30

    foreach ([['2026-11-17', 'special_working', 'Late'], ['2026-11-24', 'regular', 'On-Time'], ['2026-11-25', 'special_non_working', 'On-Time']] as [$date, $type, $expected]) {
        holiday($date, $type);
        Carbon::setTestNow(Carbon::parse("$date 09:00:00", 'Asia/Manila'));   // 1.5 hours after the start time
        $token = $u->createToken('t')->plainTextToken;   // the clock-in reads the user from the token (made under the test clock)

        app('auth')->forgetGuards();
        $this->withHeader('Authorization', 'Bearer ' . $token)->postJson('/api/clockIn', ['location_name' => $location->name])->assertCreated();

        expect(Attendance::where('user_id', $u->id)->whereDate('date', $date)->value('status'))->toBe($expected, "$type on $date");
    }
});

// ---------- the Holidays page: type on create, edit ----------

it('create: the type is required and must be one of the three', function () {
    $hr = holidayHr();

    $this->actingAs($hr, 'sanctum')->postJson('/api/holidays', ['date' => '2026-12-08', 'name' => 'Immaculate Conception'])
        ->assertUnprocessable()->assertJsonValidationErrors(['type']);
    $this->actingAs($hr, 'sanctum')->postJson('/api/holidays', ['date' => '2026-12-08', 'name' => 'X', 'type' => 'public'])
        ->assertUnprocessable()->assertJsonValidationErrors(['type']);

    foreach (Holiday::TYPES as $i => $type) {
        $this->actingAs($hr, 'sanctum')->postJson('/api/holidays', ['date' => '2026-12-0' . ($i + 1), 'name' => "Day $i", 'type' => $type])
            ->assertCreated()->assertJsonPath('type', $type);
    }
});

it('create: two holidays cannot share a date', function () {
    $hr = holidayHr();
    holiday('2026-12-25', 'regular');

    $this->actingAs($hr, 'sanctum')->postJson('/api/holidays', ['date' => '2026-12-25', 'name' => 'Again', 'type' => 'regular'])
        ->assertUnprocessable()->assertJsonPath('errors.date.0', 'There is already a holiday on that date.');
});

it('edit: the type, name and date can be changed, and it is audited', function () {
    $hr = holidayHr();
    holiday('2026-12-24', 'regular');
    $id = Holiday::first()->id;

    $this->actingAs($hr, 'sanctum')->putJson("/api/holidays/{$id}", ['date' => '2026-12-24', 'name' => 'Christmas Eve', 'type' => 'special_non_working'])
        ->assertOk()->assertJsonPath('type', 'special_non_working')->assertJsonPath('name', 'Christmas Eve');

    expect(Holiday::find($id)->type)->toBe('special_non_working');
    expect(AuditLog::where('action', 'holiday_updated')->count())->toBe(1);
});

it('edit: keeping its own date is fine, taking another holiday date is not, an unknown id is 404', function () {
    $hr = holidayHr();
    holiday('2026-12-24', 'regular');
    holiday('2026-12-25', 'regular');
    $first = Holiday::where('date', '2026-12-24')->value('id');

    $this->actingAs($hr, 'sanctum')->putJson("/api/holidays/{$first}", ['date' => '2026-12-24', 'name' => 'Same date', 'type' => 'regular'])->assertOk();
    $this->actingAs($hr, 'sanctum')->putJson("/api/holidays/{$first}", ['date' => '2026-12-25', 'name' => 'Clash', 'type' => 'regular'])->assertUnprocessable();
    $this->actingAs($hr, 'sanctum')->putJson('/api/holidays/99999', ['date' => '2026-12-30', 'name' => 'x', 'type' => 'regular'])->assertNotFound();
});

it('an existing holiday defaults to regular, and a non-HR user cannot create or edit', function () {
    Holiday::create(['date' => '2026-11-30', 'name' => 'Bonifacio Day']);
    expect(Holiday::first()->fresh()->type)->toBe('regular');

    $teacher = holEmployee();
    $this->actingAs($teacher, 'sanctum')->postJson('/api/holidays', ['date' => '2026-12-25', 'name' => 'x', 'type' => 'regular'])->assertForbidden();
    $this->actingAs($teacher, 'sanctum')->putJson('/api/holidays/' . Holiday::first()->id, ['date' => '2026-11-30', 'name' => 'x', 'type' => 'regular'])->assertForbidden();
});
