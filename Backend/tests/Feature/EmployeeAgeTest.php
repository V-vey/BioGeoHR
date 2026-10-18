<?php

use App\Models\Users;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

const AGE_MESSAGE = 'Employee must be at least 18 years old.';

beforeEach(function () {
    // a fixed "now", a few minutes after midnight in Manila (still yesterday in UTC)
    Carbon::setTestNow(Carbon::parse('2026-10-19 00:30:00', 'Asia/Manila'));

    $this->hr = Users::create([
        'name' => 'Test HR', 'email' => 'hr@test.test', 'contact_number' => '0917', 'password' => 'x',
        'department' => 'Administrative', 'position' => 'HR Administrator', 'call_time' => '08:00:00',
        'contract_type' => 'Regular', 'date_of_birth' => '1990-01-01', 'gender' => 'Other',
        'nationality' => 'Filipino', 'address' => 'Tarlac', 'employment_status' => 'Permanent', 'is_active' => true,
    ]);
});

afterEach(fn () => Carbon::setTestNow());

function newEmployeeBody(string $dob): array
{
    return [
        'name' => 'Age Test', 'email' => 'age' . uniqid() . '@test.test', 'contact_number' => '0917', 
        'department' => 'Academic', 'position' => 'Teacher', 'call_time' => '07:30:00',
        'contract_type' => 'Regular', 'employment_status' => 'Permanent', 'date_of_birth' => $dob,
        'gender' => 'Male', 'nationality' => 'Filipino', 'address' => 'Tarlac',
        'monthly_salary' => 20000, 'working_hours_per_day' => 8,
    ];
}

function existingEmployee(): Users
{
    return Users::create([
        'name' => 'Existing', 'email' => 'existing@test.test', 'contact_number' => '0917', 'password' => 'x',
        'department' => 'Academic', 'position' => 'Teacher', 'call_time' => '07:30:00',
        'contract_type' => 'Regular', 'date_of_birth' => '1995-05-05', 'gender' => 'Male',
        'nationality' => 'Filipino', 'address' => 'Tarlac', 'employment_status' => 'Permanent', 'is_active' => true,
    ]);
}

// ---------- create ----------

it('create: exactly 18 today is accepted', function () {
    $this->actingAs($this->hr, 'sanctum')->postJson('/api/users', newEmployeeBody('2008-10-19'))->assertCreated();
});

it('create: one day under 18 is rejected with the message', function () {
    $this->actingAs($this->hr, 'sanctum')->postJson('/api/users', newEmployeeBody('2008-10-20'))
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['date_of_birth'])
        ->assertJsonPath('errors.date_of_birth.0', AGE_MESSAGE);
});

it('create: a future date is rejected', function () {
    $this->actingAs($this->hr, 'sanctum')->postJson('/api/users', newEmployeeBody('2027-01-01'))
        ->assertUnprocessable()
        ->assertJsonPath('errors.date_of_birth.0', AGE_MESSAGE);
});

it('create: the cutoff moves with the day, it is not fixed', function () {
    Carbon::setTestNow(Carbon::parse('2030-03-05 10:00:00', 'Asia/Manila'));

    $this->actingAs($this->hr, 'sanctum')->postJson('/api/users', newEmployeeBody('2012-03-05'))->assertCreated();
    $this->actingAs($this->hr, 'sanctum')->postJson('/api/users', newEmployeeBody('2012-03-06'))->assertUnprocessable();
});

it('create: on 29 Feb the day before the 18th birthday is still too young (no overflow to 1 Mar)', function () {
    Carbon::setTestNow(Carbon::parse('2028-02-29 10:00:00', 'Asia/Manila'));

    $this->actingAs($this->hr, 'sanctum')->postJson('/api/users', newEmployeeBody('2010-03-01'))->assertUnprocessable();
    $this->actingAs($this->hr, 'sanctum')->postJson('/api/users', newEmployeeBody('2010-02-28'))->assertCreated();
});

// ---------- edit ----------

it('edit: exactly 18 today is accepted and saved', function () {
    $employee = existingEmployee();

    $this->actingAs($this->hr, 'sanctum')->putJson("/api/users/{$employee->id}", ['date_of_birth' => '2008-10-19'])->assertOk();

    expect(substr((string) $employee->fresh()->date_of_birth, 0, 10))->toBe('2008-10-19');
});

it('edit: one day under 18 is rejected and nothing is saved', function () {
    $employee = existingEmployee();

    $this->actingAs($this->hr, 'sanctum')->putJson("/api/users/{$employee->id}", ['date_of_birth' => '2008-10-20'])
        ->assertUnprocessable()
        ->assertJsonPath('errors.date_of_birth.0', AGE_MESSAGE);

    expect(substr((string) $employee->fresh()->date_of_birth, 0, 10))->toBe('1995-05-05');
});

it('edit: a future date is rejected', function () {
    $employee = existingEmployee();

    $this->actingAs($this->hr, 'sanctum')->putJson("/api/users/{$employee->id}", ['date_of_birth' => '2027-01-01'])
        ->assertUnprocessable()
        ->assertJsonPath('errors.date_of_birth.0', AGE_MESSAGE);
});

it('edit: an update that does not send a date of birth is not affected', function () {
    $employee = existingEmployee();

    $this->actingAs($this->hr, 'sanctum')->putJson("/api/users/{$employee->id}", ['address' => 'Somewhere else'])->assertOk();

    expect($employee->fresh()->address)->toBe('Somewhere else');
});
