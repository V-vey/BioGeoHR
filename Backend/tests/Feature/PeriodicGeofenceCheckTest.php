<?php

use App\Models\Attendance;
use App\Models\AuditLog;
use App\Models\FlaggedAttendance;
use App\Models\Location;
use App\Models\Users;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// While clocked in, the phone sends its position every few minutes (POST geofenceCheck), or reports that the
// GPS is off (POST geofenceCheck/gpsOff). Leaving the area or turning the GPS off opens a flag for HR; the next
// check that finds the employee in range closes it.

beforeEach(function () {
    Carbon::setTestNow(Carbon::parse('2026-10-21 10:00:00', 'Asia/Manila'));
    $this->emp = Users::create([
        'name' => 'Maria Santos', 'email' => 'maria@school.test', 'contact_number' => '0917', 'password' => 'x',
        'department' => 'Academic', 'position' => 'Teacher', 'call_time' => '07:30:00',
        'contract_type' => 'Regular', 'date_of_birth' => '1990-01-01', 'gender' => 'Male',
        'nationality' => 'Filipino', 'address' => 'Tarlac', 'employment_status' => 'Permanent', 'is_active' => true,
    ]);
    $this->token = $this->emp->createToken('phone')->plainTextToken;
    $this->place = Location::create(['name' => 'Main Gate', 'latitude' => 15.4709, 'longitude' => 120.6035, 'radius' => 50]);
});

afterEach(fn () => Carbon::setTestNow());

const IN_RANGE = [15.4709, 120.6035];
const OUT_OF_RANGE = [15.4800, 120.6035]; // about 1 km away

function positionCheck($test, array $at)
{
    return $test->postJson('/api/geofenceCheck', ['userLat' => $at[0], 'userLong' => $at[1]],
        ['Authorization' => 'Bearer ' . $test->token]);
}

function gpsOffCheck($test)
{
    return $test->postJson('/api/geofenceCheck/gpsOff', [], ['Authorization' => 'Bearer ' . $test->token]);
}

function clockInToday($test): Attendance
{
    return Attendance::create(['user_id' => $test->emp->id, 'location_id' => $test->place->id, 'status' => 'On-Time',
        'date' => '2026-10-21', 'time_in' => '07:20:00']);
}

it('is within boundary in range, and flags nothing', function () {
    clockInToday($this);

    positionCheck($this, IN_RANGE)->assertOk()->assertJsonPath('message', 'Within boundary');
    expect(FlaggedAttendance::count())->toBe(0);
});

it('flags leaving the area once, and closes the flag on the way back', function () {
    $a = clockInToday($this);

    positionCheck($this, OUT_OF_RANGE)->assertOk()->assertJsonPath('message', 'Out of boundary flagged');
    positionCheck($this, OUT_OF_RANGE)->assertOk();
    expect(FlaggedAttendance::where('attendance_id', $a->id)->count())->toBe(1);

    positionCheck($this, IN_RANGE)->assertOk()->assertJsonPath('message', 'Within boundary');
    expect(FlaggedAttendance::sole()->in_at)->not->toBeNull();
});

it('answers 404 after a clock-out', function () {
    clockInToday($this)->update(['time_out' => '09:00:00']);

    positionCheck($this, IN_RANGE)->assertNotFound();
});

it('checks a second clock-in of the same day', function () {
    $a = clockInToday($this);
    $a->update(['time_out' => '09:00:00']);
    $a->update(['time_out' => null]); // what clocking in again does

    positionCheck($this, OUT_OF_RANGE)->assertOk()->assertJsonPath('message', 'Out of boundary flagged');
});

it('is not thrown by an Absent row the absence sync makes while the employee is clocked in', function () {
    clockInToday($this);
    Carbon::setTestNow(Carbon::parse('2026-10-21 10:05:00', 'Asia/Manila'));
    Attendance::create(['user_id' => $this->emp->id, 'status' => 'Absent', 'date' => '2026-10-20']);

    positionCheck($this, OUT_OF_RANGE)->assertOk()->assertJsonPath('message', 'Out of boundary flagged');
});

it('answers 404 when the only row today is an Absent one', function () {
    Attendance::create(['user_id' => $this->emp->id, 'status' => 'Absent', 'date' => '2026-10-21']);

    positionCheck($this, OUT_OF_RANGE)->assertNotFound();
});

it('ignores a day the employee forgot to clock out of', function () {
    Attendance::create(['user_id' => $this->emp->id, 'location_id' => $this->place->id, 'status' => 'On-Time',
        'date' => '2026-10-20', 'time_in' => '07:20:00']);

    positionCheck($this, OUT_OF_RANGE)->assertNotFound();
    expect(FlaggedAttendance::count())->toBe(0);
});

it('flags the GPS being turned off while clocked in, with one audit line', function () {
    $a = clockInToday($this);

    gpsOffCheck($this)->assertOk()->assertJsonPath('message', 'GPS off flagged');

    expect(FlaggedAttendance::where('attendance_id', $a->id)->whereNull('in_at')->count())->toBe(1);
    $log = AuditLog::where('action', 'gps_off')->sole();
    expect($log->status)->toBe('failed');
    expect($log->user_id)->toBe($this->emp->id);
    expect($log->description)->toBe('GPS/Location turned off while clocked in at Main Gate (Mobile)');
});

it('keeps one flag and one audit line while the GPS stays off', function () {
    clockInToday($this);

    gpsOffCheck($this)->assertOk();
    gpsOffCheck($this)->assertOk();
    gpsOffCheck($this)->assertOk();

    expect(FlaggedAttendance::count())->toBe(1);
    expect(AuditLog::where('action', 'gps_off')->count())->toBe(1);
});

it('closes the GPS-off flag when the GPS is back on and the employee is in range', function () {
    clockInToday($this);

    gpsOffCheck($this)->assertOk();
    positionCheck($this, IN_RANGE)->assertOk()->assertJsonPath('message', 'Within boundary');

    expect(FlaggedAttendance::sole()->in_at)->not->toBeNull();
});

it('does not add a second flag when the GPS goes off after leaving the area', function () {
    clockInToday($this);

    positionCheck($this, OUT_OF_RANGE)->assertOk();
    gpsOffCheck($this)->assertOk();

    expect(FlaggedAttendance::count())->toBe(1);
});

it('answers 404 for GPS off when not clocked in, and flags nothing', function () {
    gpsOffCheck($this)->assertNotFound();

    expect(FlaggedAttendance::count())->toBe(0);
    expect(AuditLog::where('action', 'gps_off')->count())->toBe(0);
});
