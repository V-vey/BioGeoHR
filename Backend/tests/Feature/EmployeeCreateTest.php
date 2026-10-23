<?php

use App\Models\Users;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->hr = Users::create([
        'name' => 'Test HR', 'email' => 'hr@test.test', 'contact_number' => '0917', 'password' => 'x',
        'department' => 'Administrative', 'position' => 'HR Administrator', 'call_time' => '08:00:00',
        'contract_type' => 'Regular', 'date_of_birth' => '1990-01-01', 'gender' => 'Other',
        'nationality' => 'Filipino', 'address' => 'Tarlac', 'employment_status' => 'Permanent', 'is_active' => true,
    ]);
});

function createEmployeeBody(array $overrides = []): array
{
    return $overrides + [
        'name' => 'Create Test', 'email' => 'create@test.test', 'contact_number' => '0917',
        'department' => 'Academic', 'position' => 'Teacher', 'call_time' => '07:30:00',
        'contract_type' => 'Regular', 'employment_status' => 'Permanent', 'date_of_birth' => '1995-05-05',
        'gender' => 'Male', 'nationality' => 'Filipino', 'address' => 'Tarlac',
        'monthly_salary' => 20000, 'working_hours_per_day' => 8,
    ];
}

it('rejects an email that another employee already has, with a message instead of a crash', function () {
    $this->actingAs($this->hr, 'sanctum')->postJson('/api/users', createEmployeeBody(['email' => 'hr@test.test']))
        ->assertUnprocessable()
        ->assertJsonPath('errors.email.0', 'An employee with this email already exists.');
});

it('rejects a salary too big for the salary column, and saves no employee', function () {
    $this->actingAs($this->hr, 'sanctum')->postJson('/api/users', createEmployeeBody(['monthly_salary' => 23123123]))
        ->assertUnprocessable()
        ->assertJsonPath('errors.monthly_salary.0', 'The monthly salary cannot be more than ₱999,999.99.');

    expect(Users::where('email', 'create@test.test')->exists())->toBeFalse();
});

it('accepts the largest salary the column holds, with its salary and leave balance', function () {
    $this->actingAs($this->hr, 'sanctum')->postJson('/api/users', createEmployeeBody(['monthly_salary' => 999999.99]))
        ->assertCreated();

    $user = Users::where('email', 'create@test.test')->firstOrFail();
    expect(\App\Models\Salary::where('user_id', $user->id)->value('salary_basis'))->toEqual('999999.99');
    expect(\App\Models\LeaveBalance::where('user_id', $user->id)->exists())->toBeTrue();
});
