<?php

use App\Models\Users;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

const PHONE_ERROR = 'Enter a Philippine mobile number, for example 0917 123 4567 or +63 917 123 4567.';

beforeEach(function () {
    $this->hr = Users::create([
        'name' => 'Test HR', 'email' => 'hr@test.test', 'contact_number' => '09170000000', 'password' => 'x',
        'department' => 'Administrative', 'position' => 'HR Administrator', 'call_time' => '08:00:00',
        'contract_type' => 'Regular', 'date_of_birth' => '1990-01-01', 'gender' => 'Other',
        'nationality' => 'Filipino', 'address' => 'Tarlac', 'employment_status' => 'Permanent', 'is_active' => true,
    ]);
});

function phoneEmployeeBody(string $phone): array
{
    return [
        'name' => 'Phone Test', 'email' => 'phone' . uniqid() . '@test.test', 'contact_number' => $phone,
        'department' => 'Academic', 'position' => 'Teacher', 'call_time' => '07:30:00',
        'contract_type' => 'Regular', 'employment_status' => 'Permanent', 'date_of_birth' => '1995-05-05',
        'gender' => 'Male', 'nationality' => 'Filipino', 'address' => 'Tarlac',
        'monthly_salary' => 20000, 'working_hours_per_day' => 8,
    ];
}

it('turns every way of writing a PH mobile number into 09XXXXXXXXX', function () {
    expect(Users::formatPhone('0917 123 4567'))->toBe('09171234567');
    expect(Users::formatPhone('0917-123-4567'))->toBe('09171234567');
    expect(Users::formatPhone('+63 917 123 4567'))->toBe('09171234567');
    expect(Users::formatPhone('639171234567'))->toBe('09171234567');
});

it('saves a new employee\'s +63 number as 09XXXXXXXXX', function () {
    $this->actingAs($this->hr, 'sanctum')->postJson('/api/users', phoneEmployeeBody('+63 917 123 4567'))
        ->assertCreated();

    expect(Users::where('name', 'Phone Test')->value('contact_number'))->toBe('09171234567');
});

it('refuses a number that is not a PH mobile number', function (string $phone) {
    $this->actingAs($this->hr, 'sanctum')->postJson('/api/users', phoneEmployeeBody($phone))
        ->assertUnprocessable()
        ->assertJsonPath('errors.contact_number.0', PHONE_ERROR);
})->with([
    'too short'          => '0917',
    'letters'            => '0917abc4567',
    'landline'           => '045 982 1234',
    'one digit too many' => '091712345678',
    'not a 09 mobile'    => '08171234567',
]);

it('HR\'s edit refuses a bad number and keeps the old one', function () {
    $employee = Users::create(['contact_number' => '09181112222'] + array_diff_key(phoneEmployeeBody('x'), ['monthly_salary' => 0, 'working_hours_per_day' => 0]) + ['password' => 'x']);

    $this->actingAs($this->hr, 'sanctum')->putJson("/api/users/{$employee->id}", ['contact_number' => '12345'])
        ->assertUnprocessable()
        ->assertJsonPath('errors.contact_number.0', PHONE_ERROR);
    expect($employee->fresh()->contact_number)->toBe('09181112222');

    $this->actingAs($this->hr, 'sanctum')->putJson("/api/users/{$employee->id}", ['contact_number' => '0919-222-3333'])
        ->assertOk();
    expect($employee->fresh()->contact_number)->toBe('09192223333');
});
