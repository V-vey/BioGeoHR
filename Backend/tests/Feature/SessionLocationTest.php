<?php

use App\Models\Attendance;
use App\Models\AuditLog;
use App\Models\FlaggedAttendance;
use App\Models\Location;
use App\Models\SystemSetting;
use App\Models\Users;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// Every clock-in (session) of a day has its own place. An employee who clocks out and clocks in again at another
// place is shown, and checked while clocked in, against the new place, not the first one. The day itself keeps the
// place of its first clock-in.

const SITE_A = [15.4709, 120.6035];
const SITE_B = [15.5000, 120.7000];   // about 12 km from A

beforeEach(function () {
    Carbon::setTestNow(Carbon::parse('2026-10-21 09:00:00', 'Asia/Manila'));   // a Wednesday
    SystemSetting::create();
    $this->emp = Users::create([
        'name' => 'Maria Santos', 'email' => 'maria@school.test', 'contact_number' => '0917', 'password' => 'x',
        'department' => 'Academic', 'position' => 'Teacher', 'call_time' => '08:00:00',
        'contract_type' => 'Regular', 'date_of_birth' => '1990-01-01', 'gender' => 'Male',
        'nationality' => 'Filipino', 'address' => 'Tarlac', 'employment_status' => 'Permanent', 'is_active' => true,
    ]);
    $this->token = $this->emp->createToken('phone')->plainTextToken;
    $this->a = Location::create(['name' => 'Site A', 'latitude' => SITE_A[0], 'longitude' => SITE_A[1], 'radius' => 50]);
    $this->b = Location::create(['name' => 'Site B', 'latitude' => SITE_B[0], 'longitude' => SITE_B[1], 'radius' => 50]);
});

afterEach(fn () => Carbon::setTestNow());

function slPost($test, string $path, array $body = [])
{
    app('auth')->forgetGuards();

    return $test->withHeader('Authorization', 'Bearer ' . $test->token)->postJson($path, $body);
}

function slGet($test, string $path)
{
    app('auth')->forgetGuards();

    return $test->withHeader('Authorization', 'Bearer ' . $test->token)->getJson($path);
}

function slClockIn($test, string $place, array $at)
{
    return slPost($test, '/api/clockIn', ['location_name' => $place, 'userLat' => $at[0], 'userLong' => $at[1]]);
}

function slLater(int $minutes): void
{
    Carbon::setTestNow(now()->addMinutes($minutes));
}

// clock in at A, out, in again at B (the second session)
function slAtBSecondTime($test): Attendance
{
    slClockIn($test, 'Site A', SITE_A)->assertCreated();
    slLater(10);
    slPost($test, '/api/clockOut')->assertOk();
    slLater(10);
    slClockIn($test, 'Site B', SITE_B)->assertCreated();

    return Attendance::sole();
}

it('gives each clock-in its own place, and the day keeps the place of the first', function () {
    $day = slAtBSecondTime($this);

    $sessions = $day->sessions()->orderBy('id')->get();
    expect($sessions)->toHaveCount(2);
    expect($sessions[0]->location_id)->toBe($this->a->id);
    expect($sessions[1]->location_id)->toBe($this->b->id);
    expect($day->location_id)->toBe($this->a->id);
});

it('tells the phone the place of the session that is running, not the first one', function () {
    slAtBSecondTime($this);

    slGet($this, '/api/todayAttendance')->assertOk()->assertJson(['running' => true, 'location' => 'Site B']);
});

it('still shows the last place after the employee clocks out', function () {
    slAtBSecondTime($this);
    slLater(30);
    slPost($this, '/api/clockOut')->assertOk();

    slGet($this, '/api/todayAttendance')->assertOk()->assertJson(['running' => false, 'location' => 'Site B']);
});

it('checks the position while clocked in against the place clocked in at now', function () {
    slAtBSecondTime($this);

    // at B: inside the place the employee clocked in at, so nothing is flagged
    slPost($this, '/api/geofenceCheck', ['userLat' => SITE_B[0], 'userLong' => SITE_B[1]])->assertOk()->assertJsonPath('message', 'Within boundary');
    expect(FlaggedAttendance::count())->toBe(0);

    // back at A: outside B, so it is flagged (before the fix this was "in range" of the first place)
    slLater(10);
    slPost($this, '/api/geofenceCheck', ['userLat' => SITE_A[0], 'userLong' => SITE_A[1]]);
    expect(FlaggedAttendance::count())->toBe(1);
    expect(FlaggedAttendance::sole()->in_at)->toBeNull();
});

it('names the current place when the GPS is turned off while clocked in', function () {
    slAtBSecondTime($this);

    slPost($this, '/api/geofenceCheck/gpsOff')->assertOk();

    expect(AuditLog::where('action', 'gps_off')->sole()->description)->toContain('Site B');
});

it('the first clock-in of the day is checked against its own place as before', function () {
    slClockIn($this, 'Site A', SITE_A)->assertCreated();

    slPost($this, '/api/geofenceCheck', ['userLat' => SITE_A[0], 'userLong' => SITE_A[1]])->assertJsonPath('message', 'Within boundary');
    expect(Attendance::sole()->sessions()->sole()->location_id)->toBe($this->a->id);
});

it('a day entered by hand gets the place on its session', function () {
    $hr = Users::create([
        'name' => 'Test HR', 'email' => 'hr@test.test', 'contact_number' => '0917', 'password' => 'x',
        'department' => 'Administrative', 'position' => 'HR Administrator', 'call_time' => '08:00:00',
        'contract_type' => 'Regular', 'date_of_birth' => '1990-01-01', 'gender' => 'Other',
        'nationality' => 'Filipino', 'address' => 'Tarlac', 'employment_status' => 'Permanent', 'is_active' => true,
    ]);

    $this->actingAs($hr, 'sanctum')->postJson('/api/attendance', [
        'user_id' => $this->emp->id, 'date' => '2026-10-20', 'status' => 'On-Time', 'location_id' => $this->b->id,
        'time_in' => '08:00', 'time_out' => '17:00', 'remarks' => 'Device was down',
    ])->assertCreated();

    expect(Attendance::sole()->sessions()->sole()->location_id)->toBe($this->b->id);
});

it('a day whose sessions have no place yet (older data) falls back to the place of the day', function () {
    $day = Attendance::create(['user_id' => $this->emp->id, 'location_id' => $this->a->id, 'status' => 'On-Time', 'date' => '2026-10-21', 'time_in' => '08:00:00']);
    $day->sessions()->create(['time_in' => '08:00:00']);   // made before sessions had a place

    expect($day->currentLocationId())->toBe($this->a->id);
    slGet($this, '/api/todayAttendance')->assertOk()->assertJson(['location' => 'Site A']);
});
