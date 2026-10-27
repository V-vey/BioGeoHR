<?php

use App\Models\LeaveBalance;
use App\Models\Salary;
use App\Models\Users;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->hr = Users::create([
        'name' => 'Test HR', 'email' => 'hr@test.test', 'contact_number' => '09170000000', 'password' => 'x',
        'department' => 'Administrative', 'position' => 'HR Administrator', 'call_time' => '08:00:00',
        'contract_type' => 'Regular', 'date_of_birth' => '1990-01-01', 'gender' => 'Other',
        'nationality' => 'Filipino', 'address' => 'Tarlac', 'employment_status' => 'Permanent', 'is_active' => true,
    ]);
});

function createEmployeeBody(array $overrides = []): array
{
    return $overrides + [
        'name' => 'New Hire', 'email' => 'newhire@test.test', 'contact_number' => '0917 123 4567',
        'department' => 'Academic', 'position' => 'Teacher', 'call_time' => '07:30:00',
        'contract_type' => 'Regular', 'employment_status' => 'Permanent', 'date_of_birth' => '1995-05-05',
        'gender' => 'Male', 'nationality' => 'Filipino', 'address' => 'Tarlac',
        'monthly_salary' => 20000, 'working_hours_per_day' => 8,
    ];
}

it('creates the employee with a salary and a leave balance', function () {
    $this->actingAs($this->hr, 'sanctum')->postJson('/api/users', createEmployeeBody())->assertCreated();

    $user = Users::where('email', 'newhire@test.test')->first();
    expect($user)->not->toBeNull();
    expect(Salary::where('user_id', $user->id)->exists())->toBeTrue();
    expect(LeaveBalance::where('user_id', $user->id)->exists())->toBeTrue();
});

it('refuses a salary too large for the database and saves nothing', function () {
    $this->actingAs($this->hr, 'sanctum')->postJson('/api/users', createEmployeeBody(['monthly_salary' => 1000000]))
        ->assertUnprocessable()
        ->assertJsonPath('errors.monthly_salary.0', 'The monthly salary cannot be more than ₱999,999.99.');

    expect(Users::where('email', 'newhire@test.test')->exists())->toBeFalse();
});

it('refuses a salary that is zero or not a number', function ($salary) {
    $this->actingAs($this->hr, 'sanctum')->postJson('/api/users', createEmployeeBody(['monthly_salary' => $salary]))
        ->assertUnprocessable()->assertJsonValidationErrors(['monthly_salary']);
})->with([0, -5, 'abc']);

it('refuses an email that is already used, with a clear message', function () {
    $this->actingAs($this->hr, 'sanctum')->postJson('/api/users', createEmployeeBody(['email' => 'hr@test.test']))
        ->assertUnprocessable()
        ->assertJsonPath('errors.email.0', 'This email is already used by another employee.');

    expect(Users::where('email', 'hr@test.test')->count())->toBe(1);
});

it('leaves no employee and no photo behind when a later save fails', function () {
    Storage::fake('public');
    // make the salary row fail after the employee row is written
    Salary::creating(fn () => throw new RuntimeException('salary save failed'));

    $this->actingAs($this->hr, 'sanctum')
        ->post('/api/users', createEmployeeBody(['image' => UploadedFile::fake()->image('me.jpg')]), ['Accept' => 'application/json'])
        ->assertServerError();

    expect(Users::where('email', 'newhire@test.test')->exists())->toBeFalse();
    expect(Storage::disk('public')->allFiles('avatars'))->toBe([]);
});
