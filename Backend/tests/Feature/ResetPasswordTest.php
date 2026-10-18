<?php

use App\Models\AuditLog;
use App\Models\Users;
use App\Rules\StrongPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Laravel\Sanctum\PersonalAccessToken;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->hr = Users::create([
        'name' => 'Test HR', 'email' => 'hr@test.test', 'contact_number' => '0917', 'password' => 'HrPass123',
        'department' => 'Administrative', 'position' => 'HR Administrator', 'call_time' => '08:00:00',
        'contract_type' => 'Regular', 'date_of_birth' => '1990-01-01', 'gender' => 'Other',
        'nationality' => 'Filipino', 'address' => 'Tarlac', 'employment_status' => 'Permanent', 'is_active' => true,
    ]);
    $this->teacher = Users::create([
        'name' => 'Forgetful Teacher', 'email' => 'teacher@test.test', 'contact_number' => '0917', 'password' => 'OldPass123',
        'department' => 'Academic', 'position' => 'Teacher', 'call_time' => '07:30:00',
        'contract_type' => 'Regular', 'date_of_birth' => '1990-01-01', 'gender' => 'Male',
        'nationality' => 'Filipino', 'address' => 'Tarlac', 'employment_status' => 'Permanent', 'is_active' => true,
    ]);
});

// the new password in the reset email the (array) mailer kept
function resetEmailPassword(): ?string
{
    $message = Mail::mailer()->getSymfonyTransport()->messages()->last();

    return $message && preg_match('/New password: (\S+)/', $message->getOriginalMessage()->getTextBody(), $m) ? $m[1] : null;
}

it('HR resets a password: a new one is emailed, it works, and the old one does not', function () {
    $this->actingAs($this->hr, 'sanctum')->postJson("/api/users/{$this->teacher->id}/resetPassword")
        ->assertOk()
        ->assertJsonPath('email_sent', true)
        ->assertJsonPath('temporary_password', null);   // not shown to HR when the email went out

    $new = resetEmailPassword();
    expect($new)->not->toBeNull();
    expect(Validator::make(['p' => $new], ['p' => [new StrongPassword]])->passes())->toBeTrue();

    $stored = $this->teacher->fresh()->password;
    expect(Hash::check($new, $stored))->toBeTrue();
    expect(Hash::check('OldPass123', $stored))->toBeFalse();
});

it('the employee can log in with the emailed password, not the old one', function () {
    $this->actingAs($this->hr, 'sanctum')->postJson("/api/users/{$this->teacher->id}/resetPassword")->assertOk();
    $new = resetEmailPassword();

    app('auth')->forgetGuards();
    $this->postJson('/api/login', ['email' => 'teacher@test.test', 'password' => $new, 'platform' => 'mobile'])->assertStatus(201);
    $this->postJson('/api/login', ['email' => 'teacher@test.test', 'password' => 'OldPass123', 'platform' => 'mobile'])->assertStatus(301);
});

it('a reset logs the employee out everywhere', function () {
    $token = $this->teacher->createToken('Mobile')->plainTextToken;
    expect(PersonalAccessToken::where('tokenable_id', $this->teacher->id)->count())->toBe(1);

    $this->actingAs($this->hr, 'sanctum')->postJson("/api/users/{$this->teacher->id}/resetPassword")->assertOk();

    expect(PersonalAccessToken::where('tokenable_id', $this->teacher->id)->count())->toBe(0);
    app('auth')->forgetGuards();
    $this->withHeader('Authorization', "Bearer {$token}")->getJson('/api/profile')->assertUnauthorized();
});

it('when the email cannot be sent, HR is shown the new password once', function () {
    Mail::shouldReceive('raw')->once()->andThrow(new RuntimeException('smtp down'));

    $response = $this->actingAs($this->hr, 'sanctum')->postJson("/api/users/{$this->teacher->id}/resetPassword")
        ->assertOk()
        ->assertJsonPath('email_sent', false);

    $shown = $response->json('temporary_password');
    expect($shown)->toBeString();
    expect(Hash::check($shown, $this->teacher->fresh()->password))->toBeTrue();
});

it('is written in the audit log, without the password', function () {
    $this->actingAs($this->hr, 'sanctum')->postJson("/api/users/{$this->teacher->id}/resetPassword")->assertOk();
    $new = resetEmailPassword();

    $log = AuditLog::where('action', 'password_reset')->sole();
    expect($log->category)->toBe('admin');
    expect($log->status)->toBe('success');
    expect($log->user_id)->toBe($this->hr->id);
    expect($log->description)->toBe('Forgetful Teacher');
    expect(AuditLog::where('description', 'like', "%{$new}%")->count())->toBe(0);
});

it('HR cannot reset their own password here', function () {
    $this->actingAs($this->hr, 'sanctum')->postJson("/api/users/{$this->hr->id}/resetPassword")->assertUnprocessable();

    expect(Hash::check('HrPass123', $this->hr->fresh()->password))->toBeTrue();
});

it('an employee who is not HR cannot reset anyone', function () {
    $other = Users::create([
        'name' => 'Other', 'email' => 'other@test.test', 'contact_number' => '0917', 'password' => 'OtherPass1',
        'department' => 'Academic', 'position' => 'Teacher', 'call_time' => '07:30:00',
        'contract_type' => 'Regular', 'date_of_birth' => '1990-01-01', 'gender' => 'Male',
        'nationality' => 'Filipino', 'address' => 'Tarlac', 'employment_status' => 'Permanent', 'is_active' => true,
    ]);

    $this->actingAs($other, 'sanctum')->postJson("/api/users/{$this->teacher->id}/resetPassword")->assertForbidden();

    expect(Hash::check('OldPass123', $this->teacher->fresh()->password))->toBeTrue();
});

it('an unknown employee is a 404, and no token means 401', function () {
    $this->actingAs($this->hr, 'sanctum')->postJson('/api/users/99999/resetPassword')->assertNotFound();

    app('auth')->forgetGuards();
    $this->postJson("/api/users/{$this->teacher->id}/resetPassword")->assertUnauthorized();
});
