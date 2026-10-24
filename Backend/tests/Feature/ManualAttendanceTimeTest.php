<?php

use App\Models\Attendance;
use App\Models\Location;
use App\Models\Users;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

const FUTURE_TIME_MESSAGE = 'The clock-in and clock-out cannot be later than the time now (10:00).';

beforeEach(function () {
    // a Wednesday, 10:00 in Manila
    Carbon::setTestNow(Carbon::parse('2026-10-21 10:00:00', 'Asia/Manila'));

    $this->hr = Users::create([
        'name' => 'Test HR', 'email' => 'hr@test.test', 'contact_number' => '0917', 'password' => 'x',
        'department' => 'Administrative', 'position' => 'HR Administrator', 'call_time' => '08:00:00',
        'contract_type' => 'Regular', 'date_of_birth' => '1990-01-01', 'gender' => 'Other',
        'nationality' => 'Filipino', 'address' => 'Tarlac', 'employment_status' => 'Permanent', 'is_active' => true,
    ]);
    $this->location = Location::create(['name' => 'School', 'latitude' => 15.48, 'longitude' => 120.59, 'radius' => 50]);
});

afterEach(fn () => Carbon::setTestNow());

function manualAttendance(array $overrides): array
{
    return $overrides + [
        'user_id' => test()->hr->id, 'date' => '2026-10-21', 'status' => 'On-Time',
        'location_id' => test()->location->id, 'time_in' => '08:00', 'remarks' => 'Fingerprint device was down',
    ];
}

it('rejects a clock-in later than now on today', function () {
    $this->actingAs($this->hr, 'sanctum')->postJson('/api/attendance', manualAttendance(['time_in' => '10:01']))
        ->assertUnprocessable()
        ->assertJsonPath('message', FUTURE_TIME_MESSAGE);

    expect(Attendance::count())->toBe(0);
});

it('rejects a clock-out later than now on today', function () {
    $this->actingAs($this->hr, 'sanctum')->postJson('/api/attendance', manualAttendance(['time_out' => '17:00']))
        ->assertUnprocessable()
        ->assertJsonPath('message', FUTURE_TIME_MESSAGE);
});

it('accepts a clock-in and clock-out up to the time now on today', function () {
    $this->actingAs($this->hr, 'sanctum')->postJson('/api/attendance', manualAttendance(['time_out' => '10:00']))
        ->assertCreated();
});

it('accepts any time on a past day', function () {
    $this->actingAs($this->hr, 'sanctum')
        ->postJson('/api/attendance', manualAttendance(['date' => '2026-10-20', 'time_in' => '08:00', 'time_out' => '17:00']))
        ->assertCreated();
});

// ---------- On-Time / Late from the clock-in (the employee arrives at 08:00) ----------

function savedStatus(array $overrides): string
{
    test()->actingAs(test()->hr, 'sanctum')->postJson('/api/attendance', manualAttendance($overrides))->assertSuccessful();

    return Attendance::where('date', $overrides['date'] ?? '2026-10-21')->value('status');
}

it('is On-Time up to the arrival time plus the grace period', function () {
    \App\Models\SystemSetting::create(['late_grace_period_minutes' => 10, 'geofence_check_interval_minutes' => 15]);

    expect(savedStatus(['status' => 'Present', 'time_in' => '08:10']))->toBe('On-Time');
});

it('is Late after the grace period, even when the form sent On-Time', function () {
    \App\Models\SystemSetting::create(['late_grace_period_minutes' => 10, 'geofence_check_interval_minutes' => 15]);

    expect(savedStatus(['status' => 'On-Time', 'time_in' => '08:11']))->toBe('Late');
});

it('is On-Time for an early clock-in, even when the form sent Late', function () {
    expect(savedStatus(['status' => 'Late', 'time_in' => '07:00']))->toBe('On-Time');
});

// HR's entry goes by the time only: no weekend or holiday exception (that is for the phone's clock-in)
it('is Late on a Saturday too when past the grace period', function () {
    expect(savedStatus(['date' => '2026-10-17', 'time_in' => '09:30']))->toBe('Late');
});

it('is Late on a non-working holiday too when past the grace period', function () {
    \App\Models\Holiday::create(['date' => '2026-10-20', 'name' => 'Test holiday', 'type' => 'special_non_working']);

    expect(savedStatus(['date' => '2026-10-20', 'time_in' => '09:30']))->toBe('Late');
});

it('does not check times for an absence today', function () {
    $this->actingAs($this->hr, 'sanctum')
        ->postJson('/api/attendance', manualAttendance(['status' => 'Absent', 'time_in' => null, 'location_id' => null]))
        ->assertCreated();
});
