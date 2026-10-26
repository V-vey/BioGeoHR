<?php

use App\Models\Attendance;
use App\Models\Location;
use App\Models\Users;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// HR's "Create attendance" form. When an employee and a day are chosen the form asks what that employee
// already has (lookup) and starts from it; saving replaces that day's record and its clock-in sessions.

function manualPerson(string $name, string $email, string $dept = 'Academic', string $pos = 'Teacher'): Users
{
    return Users::create([
        'name' => $name, 'email' => $email, 'contact_number' => '0917', 'password' => 'x',
        'department' => $dept, 'position' => $pos, 'call_time' => '07:30:00',
        'contract_type' => 'Regular', 'date_of_birth' => '1990-01-01', 'gender' => 'Male',
        'nationality' => 'Filipino', 'address' => 'Tarlac', 'employment_status' => 'Permanent', 'is_active' => true,
    ]);
}

beforeEach(function () {
    Carbon::setTestNow(Carbon::parse('2026-10-21 10:00:00', 'Asia/Manila'));   // a Wednesday
    $this->hr = manualPerson('Test HR', 'hr@test.test', 'Administrative', 'HR Administrator');
    $this->emp = manualPerson('Maria Santos', 'maria@school.test');
    $this->place = Location::create(['name' => 'Main Gate', 'latitude' => 15.4709, 'longitude' => 120.6035, 'radius' => 50]);
});

afterEach(fn () => Carbon::setTestNow());

// what the phone leaves behind: a day with a first session still running
function phoneDay($test, string $date = '2026-10-21'): Attendance
{
    $a = Attendance::create([
        'user_id' => $test->emp->id, 'location_id' => $test->place->id, 'status' => 'On-Time',
        'date' => $date, 'time_in' => '07:20:00',
    ]);
    $a->sessions()->create(['time_in' => '07:20:00']);

    return $a;
}

it('lookup says there is no record when the employee has nothing on that day', function () {
    $this->actingAs($this->hr, 'sanctum')
        ->getJson('/api/attendance/lookup?' . http_build_query(['user_id' => $this->emp->id, 'date' => '2026-10-21']))
        ->assertOk()->assertExactJson(['found' => false]);
});

it('lookup returns the clock-in, the location and the status the employee already has', function () {
    phoneDay($this);

    $this->actingAs($this->hr, 'sanctum')
        ->getJson('/api/attendance/lookup?' . http_build_query(['user_id' => $this->emp->id, 'date' => '2026-10-21']))
        ->assertOk()
        ->assertJson([
            'found' => true, 'status' => 'On-Time', 'location_id' => $this->place->id,
            'time_in' => '07:20', 'time_out' => null, 'sessions' => 1,
        ]);
});

it('lookup counts the clock-in/out pairs of a day with several', function () {
    $a = phoneDay($this);
    $a->sessions()->first()->update(['time_out' => '12:00:00']);
    $a->sessions()->create(['time_in' => '13:00:00', 'time_out' => '17:00:00']);

    $this->actingAs($this->hr, 'sanctum')
        ->getJson('/api/attendance/lookup?' . http_build_query(['user_id' => $this->emp->id, 'date' => '2026-10-21']))
        ->assertOk()->assertJsonPath('sessions', 2);
});

it('lookup needs an employee and a date', function () {
    $this->actingAs($this->hr, 'sanctum')->getJson('/api/attendance/lookup')
        ->assertStatus(422)->assertJsonValidationErrors(['user_id', 'date']);
});

it('adding the clock-out by hand closes the phone\'s running session, so the hours are counted', function () {
    $a = phoneDay($this);
    Carbon::setTestNow(Carbon::parse('2026-10-21 17:00:00', 'Asia/Manila'));   // after the clock-out entered below

    $this->actingAs($this->hr, 'sanctum')->postJson('/api/attendance', [
        'user_id' => $this->emp->id, 'date' => '2026-10-21', 'status' => 'On-Time',
        'location_id' => $this->place->id, 'time_in' => '07:20', 'time_out' => '16:20', 'remarks' => 'Forgot to clock out',
    ])->assertOk();                                       // updated, not created

    expect(Attendance::where('user_id', $this->emp->id)->count())->toBe(1);   // no second record for the day
    $row = Attendance::selectRaw('attendances.*, ' . Attendance::workedSecondsSql() . ' as worked')->find($a->id);
    expect((int) $row->worked)->toBe(9 * 3600);           // 07:20 to 16:20
    expect($a->sessions()->count())->toBe(1);
});

it('saving replaces every earlier session of the day with the one entered', function () {
    $a = phoneDay($this);
    $a->sessions()->first()->update(['time_out' => '12:00:00']);
    $a->sessions()->create(['time_in' => '13:00:00', 'time_out' => '17:00:00']);
    Carbon::setTestNow(Carbon::parse('2026-10-21 17:30:00', 'Asia/Manila'));   // after the times entered below

    $this->actingAs($this->hr, 'sanctum')->postJson('/api/attendance', [
        'user_id' => $this->emp->id, 'date' => '2026-10-21', 'status' => 'On-Time',
        'location_id' => $this->place->id, 'time_in' => '07:30', 'time_out' => '16:30', 'remarks' => 'Corrected',
    ])->assertOk();

    expect($a->sessions()->count())->toBe(1);
    expect(substr($a->sessions()->first()->time_in, 0, 5))->toBe('07:30');
    expect(substr($a->sessions()->first()->time_out, 0, 5))->toBe('16:30');
});

it('marking the day absent removes its sessions', function () {
    $a = phoneDay($this);

    $this->actingAs($this->hr, 'sanctum')->postJson('/api/attendance', [
        'user_id' => $this->emp->id, 'date' => '2026-10-21', 'status' => 'Absent', 'remarks' => 'Entered by mistake',
    ])->assertOk();

    expect($a->sessions()->count())->toBe(0);
    expect(Attendance::find($a->id)->time_in)->toBeNull();
});

it('a new day entered by hand gets one session, and saving the same day again does not add a second record', function () {
    $body = [
        'user_id' => $this->emp->id, 'date' => '2026-10-20', 'status' => 'Late',
        'location_id' => $this->place->id, 'time_in' => '08:10', 'time_out' => '17:00', 'remarks' => 'Device was down',
    ];
    $this->actingAs($this->hr, 'sanctum')->postJson('/api/attendance', $body)->assertCreated();
    $this->actingAs($this->hr, 'sanctum')->postJson('/api/attendance', $body)->assertOk();

    $day = Attendance::where('user_id', $this->emp->id)->sole();
    expect($day->sessions()->count())->toBe(1);
});

it('a day in the future is refused', function () {
    $this->actingAs($this->hr, 'sanctum')->postJson('/api/attendance', [
        'user_id' => $this->emp->id, 'date' => '2026-10-22', 'status' => 'On-Time',
        'location_id' => $this->place->id, 'time_in' => '07:30', 'remarks' => 'Too early',
    ])->assertStatus(422)->assertJsonValidationErrors(['date']);
});

// "now" is 10:00 on 2026-10-21 (see beforeEach)
it('today, a clock-in or clock-out later than now is refused', function () {
    $body = [
        'user_id' => $this->emp->id, 'date' => '2026-10-21', 'status' => 'On-Time',
        'location_id' => $this->place->id, 'time_in' => '07:30', 'remarks' => 'Device was down',
    ];
    $message = 'The clock-in and clock-out cannot be later than the time now (10:00).';

    $this->actingAs($this->hr, 'sanctum')->postJson('/api/attendance', ['time_in' => '10:01'] + $body)
        ->assertStatus(422)->assertJsonPath('message', $message);
    $this->actingAs($this->hr, 'sanctum')->postJson('/api/attendance', ['time_out' => '16:00'] + $body)
        ->assertStatus(422)->assertJsonPath('message', $message);

    expect(Attendance::count())->toBe(0);
});

it('today, times up to now are accepted, and an earlier day takes any time', function () {
    $body = [
        'user_id' => $this->emp->id, 'status' => 'On-Time',
        'location_id' => $this->place->id, 'time_in' => '07:30', 'remarks' => 'Device was down',
    ];

    $this->actingAs($this->hr, 'sanctum')->postJson('/api/attendance', ['date' => '2026-10-21', 'time_out' => '10:00'] + $body)
        ->assertCreated();
    $this->actingAs($this->hr, 'sanctum')->postJson('/api/attendance', ['date' => '2026-10-20', 'time_out' => '17:00'] + $body)
        ->assertCreated();
});

// ---------- On-Time / Late from the clock-in (the employee starts at 07:30) ----------

function manualStatusSaved($test, array $overrides): string
{
    $test->actingAs($test->hr, 'sanctum')->postJson('/api/attendance', $overrides + [
        'user_id' => $test->emp->id, 'date' => '2026-10-20', 'status' => 'Present',
        'location_id' => $test->place->id, 'remarks' => 'Device was down',
    ])->assertSuccessful();

    return Attendance::where('user_id', $test->emp->id)->value('status');
}

it('is On-Time up to the start time plus the grace period', function () {
    \App\Models\SystemSetting::create(['late_grace_period_minutes' => 10, 'geofence_check_interval_minutes' => 15]);

    expect(manualStatusSaved($this, ['time_in' => '07:40']))->toBe('On-Time');
});

it('is Late after the grace period, even when the form sent On-Time', function () {
    \App\Models\SystemSetting::create(['late_grace_period_minutes' => 10, 'geofence_check_interval_minutes' => 15]);

    expect(manualStatusSaved($this, ['status' => 'On-Time', 'time_in' => '07:41']))->toBe('Late');
});

it('is On-Time for an early clock-in, even when the form sent Late', function () {
    expect(manualStatusSaved($this, ['status' => 'Late', 'time_in' => '07:00']))->toBe('On-Time');
});

it('goes by the time only, so a late Saturday clock-in is Late too', function () {
    expect(manualStatusSaved($this, ['date' => '2026-10-17', 'time_in' => '09:00']))->toBe('Late');
});
