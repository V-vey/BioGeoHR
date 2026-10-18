<?php

use App\Models\Attendance;
use App\Models\AuditLog;
use App\Models\Users;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function gpsEmployee(): Users
{
    return Users::create([
        'name' => 'Gps Test', 'email' => 'gps@test.test', 'contact_number' => '0917', 'password' => 'x',
        'department' => 'Academic', 'position' => 'Teacher', 'call_time' => '07:30:00',
        'contract_type' => 'Regular', 'date_of_birth' => '1990-01-01', 'gender' => 'Male',
        'nationality' => 'Filipino', 'address' => 'Tarlac', 'employment_status' => 'Permanent', 'is_active' => true,
    ]);
}

it('logs a failed Check-in for the logged-in employee when the phone GPS is off', function () {
    $user = gpsEmployee();

    $this->actingAs($user, 'sanctum')->postJson('/api/clockIn/gpsOff')->assertNoContent();

    $log = AuditLog::where('category', 'check_in')->sole();
    expect($log->action)->toBe('clock_in');
    expect($log->status)->toBe('failed');
    expect($log->description)->toBe('GPS/Location is off (Mobile)');
    expect($log->user_id)->toBe($user->id);
});

it('writes a fixed message: nothing the app sends is stored', function () {
    $user = gpsEmployee();

    $this->actingAs($user, 'sanctum')->postJson('/api/clockIn/gpsOff', [
        'description' => 'made up by the app', 'status' => 'success', 'category' => 'admin', 'user_id' => 999,
    ])->assertNoContent();

    $log = AuditLog::sole();
    expect($log->description)->toBe('GPS/Location is off (Mobile)');
    expect($log->status)->toBe('failed');
    expect($log->category)->toBe('check_in');
    expect($log->user_id)->toBe($user->id);
});

it('does not clock the employee in or create any attendance', function () {
    $user = gpsEmployee();

    $this->actingAs($user, 'sanctum')->postJson('/api/clockIn/gpsOff')->assertNoContent();

    expect(Attendance::count())->toBe(0);
});

it('needs a logged-in employee: no token, no audit row', function () {
    $this->postJson('/api/clockIn/gpsOff')->assertUnauthorized();

    expect(AuditLog::count())->toBe(0);
});

// ---------- the fingerprint / face check ----------

it('logs a failed Check-in with a fixed sentence for each biometric reason', function (string $reason, string $sentence) {
    $user = gpsEmployee();

    $this->actingAs($user, 'sanctum')->postJson('/api/clockIn/biometricFailed', ['reason' => $reason])->assertNoContent();

    $log = AuditLog::where('category', 'check_in')->sole();
    expect($log->action)->toBe('clock_in');
    expect($log->status)->toBe('failed');
    expect($log->description)->toBe($sentence);
    expect($log->user_id)->toBe($user->id);
})->with([
    ['failed',        'Biometric check failed (Mobile)'],
    ['cancelled',     'Biometric check cancelled (Mobile)'],
    ['not_available', 'Biometric not available on this phone (Mobile)'],
    ['locked_out',    'Biometric locked after too many attempts (Mobile)'],
    ['error',         'Biometric check error (Mobile)'],
]);

it('rejects a biometric reason that is not on the list, so no free text is stored', function () {
    $user = gpsEmployee();

    $this->actingAs($user, 'sanctum')->postJson('/api/clockIn/biometricFailed', ['reason' => 'anything I like'])->assertUnprocessable();
    $this->actingAs($user, 'sanctum')->postJson('/api/clockIn/biometricFailed', [])->assertUnprocessable();

    expect(AuditLog::count())->toBe(0);
});

it('does not clock in on a biometric failure, and needs a token', function () {
    $this->actingAs(gpsEmployee(), 'sanctum')->postJson('/api/clockIn/biometricFailed', ['reason' => 'failed'])->assertNoContent();
    expect(Attendance::count())->toBe(0);

    app('auth')->forgetGuards();
    $this->postJson('/api/clockIn/biometricFailed', ['reason' => 'failed'])->assertUnauthorized();
    expect(AuditLog::count())->toBe(1);
});
