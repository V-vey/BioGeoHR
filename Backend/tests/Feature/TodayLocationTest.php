<?php

use App\Models\Attendance;
use App\Models\Location;
use App\Models\Users;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// The phone shows the place of today's clock-in, locked, while the employee is clocked in. It learns the
// place from the "today" answer, which is also how it finds its way back after the app is closed.

beforeEach(function () {
    Carbon::setTestNow(Carbon::parse('2026-10-21 10:00:00', 'Asia/Manila'));
    $this->emp = Users::create([
        'name' => 'Maria Santos', 'email' => 'maria@school.test', 'contact_number' => '0917', 'password' => 'x',
        'department' => 'Academic', 'position' => 'Teacher', 'call_time' => '07:30:00',
        'contract_type' => 'Regular', 'date_of_birth' => '1990-01-01', 'gender' => 'Male',
        'nationality' => 'Filipino', 'address' => 'Tarlac', 'employment_status' => 'Permanent', 'is_active' => true,
    ]);
    $this->token = $this->emp->createToken('phone')->plainTextToken;
});

afterEach(fn () => Carbon::setTestNow());

function todayAnswer($test)
{
    return $test->getJson('/api/todayAttendance', ['Authorization' => 'Bearer ' . $test->token]);
}

it('says where the employee clocked in today while they are clocked in', function () {
    $place = Location::create(['name' => 'Main Gate', 'latitude' => 15.4709, 'longitude' => 120.6035, 'radius' => 50]);
    $a = Attendance::create(['user_id' => $this->emp->id, 'location_id' => $place->id, 'status' => 'On-Time', 'date' => '2026-10-21', 'time_in' => '07:20:00']);
    $a->sessions()->create(['time_in' => '07:20:00']);

    todayAnswer($this)->assertOk()->assertJson(['running' => true, 'location' => 'Main Gate']);
});

it('still says the place after the employee has clocked out', function () {
    $place = Location::create(['name' => 'Main Gate', 'latitude' => 15.4709, 'longitude' => 120.6035, 'radius' => 50]);
    $a = Attendance::create(['user_id' => $this->emp->id, 'location_id' => $place->id, 'status' => 'On-Time', 'date' => '2026-10-21', 'time_in' => '07:20:00', 'time_out' => '09:00:00']);
    $a->sessions()->create(['time_in' => '07:20:00', 'time_out' => '09:00:00']);

    todayAnswer($this)->assertOk()->assertJson(['running' => false, 'location' => 'Main Gate']);
});

it('has no place for a day that was entered without one', function () {
    Attendance::create(['user_id' => $this->emp->id, 'location_id' => null, 'status' => 'On-Time', 'date' => '2026-10-21', 'time_in' => '07:20:00']);

    todayAnswer($this)->assertOk()->assertJsonPath('location', null);
});

it('answers 404 when nothing was clocked today, so the phone leaves the box free', function () {
    todayAnswer($this)->assertNotFound();
});
