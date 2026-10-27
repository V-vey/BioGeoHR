<?php

use App\Models\Users;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->hr = Users::create([
        'name' => 'Test HR', 'email' => 'hr@test.test', 'contact_number' => '09170000000', 'password' => 'x',
        'department' => 'Administrative', 'position' => 'HR Administrator', 'call_time' => '08:00:00',
        'contract_type' => 'Regular', 'date_of_birth' => '1990-01-01', 'gender' => 'Other',
        'nationality' => 'Filipino', 'address' => 'Tarlac', 'employment_status' => 'Permanent', 'is_active' => true,
    ]);
});

function govIdEmployeeBody(array $ids): array
{
    return $ids + [
        'name' => 'Gov Id Test', 'email' => 'gov' . uniqid() . '@test.test', 'contact_number' => '0917 123 4567',
        'department' => 'Academic', 'position' => 'Teacher', 'call_time' => '07:30:00',
        'contract_type' => 'Regular', 'employment_status' => 'Permanent', 'date_of_birth' => '1995-05-05',
        'gender' => 'Male', 'nationality' => 'Filipino', 'address' => 'Tarlac',
        'monthly_salary' => 20000, 'working_hours_per_day' => 8,
    ];
}

it('adds the dashes to digits typed with or without them', function () {
    expect(Users::formatGovId('sss_number', '1234567890'))->toBe('12-3456789-0');
    expect(Users::formatGovId('sss_number', '12-3456789-0'))->toBe('12-3456789-0');
    expect(Users::formatGovId('tin', '123 456 789'))->toBe('123-456-789');
    expect(Users::formatGovId('pagibig_number', '123456789012'))->toBe('1234-5678-9012');
});

it('keeps a number with a letter as typed, so it is refused instead of losing the letter', function () {
    expect(Users::formatGovId('sss_number', '12a3456789b0'))->toBe('12a3456789b0');
});

it('refuses a government ID with letters in it', function () {
    $this->actingAs($this->hr, 'sanctum')
        ->postJson('/api/users', govIdEmployeeBody(['sss_number' => '12a3456789b0']))
        ->assertUnprocessable()
        ->assertJsonPath('errors.sss_number.0', 'Enter a valid SSS number, for example 12-3456789-0.');

    expect(Users::where('name', 'Gov Id Test')->exists())->toBeFalse();
});

it('saves digits-only government IDs with the dashes added', function () {
    $this->actingAs($this->hr, 'sanctum')
        ->postJson('/api/users', govIdEmployeeBody(['sss_number' => '1234567890', 'pagibig_number' => '1234-5678-9012']))
        ->assertCreated();

    $saved = Users::where('name', 'Gov Id Test')->first();
    expect($saved->sss_number)->toBe('12-3456789-0');
    expect($saved->pagibig_number)->toBe('1234-5678-9012');
});
