<?php

use App\Models\SystemSetting;
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
    $this->setting = SystemSetting::create(['late_grace_period_minutes' => 15, 'geofence_check_interval_minutes' => 15]);
});

it('accepts a location check interval shorter than 15 minutes', function (int $minutes) {
    $this->actingAs($this->hr, 'sanctum')
        ->putJson("/api/systemSettings/{$this->setting->id}", ['geofence_check_interval_minutes' => $minutes])
        ->assertOk();

    expect($this->setting->fresh()->geofence_check_interval_minutes)->toEqual($minutes);
})->with([1, 5, 120]);

it('refuses an interval outside 1 to 120 minutes', function (int $minutes) {
    $this->actingAs($this->hr, 'sanctum')
        ->putJson("/api/systemSettings/{$this->setting->id}", ['geofence_check_interval_minutes' => $minutes])
        ->assertUnprocessable()->assertJsonValidationErrors(['geofence_check_interval_minutes']);

    expect($this->setting->fresh()->geofence_check_interval_minutes)->toEqual(15);
})->with([0, 121]);
