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

function textEmployeeBody(array $overrides): array
{
    return $overrides + [
        'name' => 'Text Test', 'email' => 'text' . uniqid() . '@test.test', 'contact_number' => '0917 123 4567',
        'department' => 'Academic', 'position' => 'Teacher', 'call_time' => '07:30:00',
        'contract_type' => 'Regular', 'employment_status' => 'Permanent', 'date_of_birth' => '1995-05-05',
        'gender' => 'Male', 'nationality' => 'Filipino', 'address' => 'Tarlac',
        'monthly_salary' => 20000, 'working_hours_per_day' => 8,
    ];
}

it('accepts real names with spaces, periods, hyphens, apostrophes and ñ', function (string $name) {
    $this->actingAs($this->hr, 'sanctum')->postJson('/api/users', textEmployeeBody(['name' => $name]))
        ->assertCreated();
})->with(['Harvey R. Tayag', 'Jose Dela Cruz', 'Raine Micaela T. Muñoz', "Ana-Marie D'Souza"]);

it('refuses a name with digits or other symbols', function (string $name) {
    $this->actingAs($this->hr, 'sanctum')->postJson('/api/users', textEmployeeBody(['name' => $name]))
        ->assertUnprocessable()
        ->assertJsonPath('errors.name.0', Users::NAME_MESSAGE);
})->with(['Juan2 Cruz', 'Maria@Santos', '-Ana']);

it('refuses a nationality that is not letters and spaces', function (string $nationality) {
    $this->actingAs($this->hr, 'sanctum')->postJson('/api/users', textEmployeeBody(['nationality' => $nationality]))
        ->assertUnprocessable()
        ->assertJsonPath('errors.nationality.0', Users::NATIONALITY_MESSAGE);
})->with(['Filipino1', 'Fil-Am', '123']);

it('HR\'s edit refuses a bad name or nationality and keeps the old ones', function () {
    $this->actingAs($this->hr, 'sanctum')->putJson("/api/users/{$this->hr->id}", ['name' => 'Test HR 2'])
        ->assertUnprocessable()->assertJsonValidationErrors(['name']);
    $this->actingAs($this->hr, 'sanctum')->putJson("/api/users/{$this->hr->id}", ['nationality' => 'Pinoy!'])
        ->assertUnprocessable()->assertJsonValidationErrors(['nationality']);

    expect($this->hr->fresh()->name)->toBe('Test HR');
    expect($this->hr->fresh()->nationality)->toBe('Filipino');
});
