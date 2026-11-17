<?php

use App\Models\AuditLog;
use App\Models\Attendance;
use App\Models\LeaveBalance;
use App\Models\Location;
use App\Models\Salary;
use App\Models\SystemSetting;
use App\Models\Users;
use Carbon\Carbon;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

// The fixes of the security review: login limit and uniform answers, other sessions ended on a password change,
// checked HR edits, the server checking the clock-in position, no default password in the seeders.

function secPerson(string $name, string $email, string $password = 'Secret123', bool $active = true, string $dept = 'Academic', string $pos = 'Teacher'): Users
{
    return Users::create([
        'name' => $name, 'email' => $email, 'contact_number' => '0917', 'password' => $password,
        'department' => $dept, 'position' => $pos, 'call_time' => '07:30:00',
        'contract_type' => 'Regular', 'date_of_birth' => '1990-01-01', 'gender' => 'Male',
        'nationality' => 'Filipino', 'address' => 'Tarlac', 'employment_status' => 'Permanent', 'is_active' => $active,
    ]);
}

function secHr(): Users
{
    return secPerson('Test HR', 'hr@test.test', 'Secret123', true, 'Administrative', 'HR Administrator');
}

function bearer($test, string $token)
{
    app('auth')->forgetGuards();

    return $test->withHeader('Authorization', 'Bearer ' . $token);
}

// ---------- login ----------

it('stops the guessing: after 5 wrong passwords a minute the login answers 429, even for the right password', function () {
    secPerson('Maria', 'maria@school.test');

    foreach (range(1, 5) as $i) {
        $this->postJson('/api/login', ['email' => 'maria@school.test', 'password' => "wrong{$i}", 'platform' => 'Mobile'])->assertStatus(301);
    }
    $this->postJson('/api/login', ['email' => 'maria@school.test', 'password' => 'wrong6', 'platform' => 'Mobile'])
        ->assertStatus(429)->assertJsonPath('authenticated', 'Too Many Attempts');
    $this->postJson('/api/login', ['email' => 'maria@school.test', 'password' => 'Secret123', 'platform' => 'Mobile'])->assertStatus(429);
});

it('lets the guessing start again after the minute has passed', function () {
    secPerson('Maria', 'maria@school.test');
    foreach (range(1, 6) as $i) {
        $this->postJson('/api/login', ['email' => 'maria@school.test', 'password' => "wrong{$i}"]);
    }
    $this->travel(61)->seconds();

    $this->postJson('/api/login', ['email' => 'maria@school.test', 'password' => 'Secret123', 'platform' => 'Mobile'])->assertStatus(201);
});

it('does not lock one employee out because somebody else is being guessed', function () {
    secPerson('Maria', 'maria@school.test');
    secPerson('Jose', 'jose@school.test');
    foreach (range(1, 6) as $i) {
        $this->postJson('/api/login', ['email' => 'maria@school.test', 'password' => "wrong{$i}"]);
    }

    $this->postJson('/api/login', ['email' => 'jose@school.test', 'password' => 'Secret123', 'platform' => 'Mobile'])->assertStatus(201);
});

it('answers an email that does not exist exactly like a wrong password', function () {
    secPerson('Maria', 'maria@school.test');

    $unknown = $this->postJson('/api/login', ['email' => 'nobody@school.test', 'password' => 'Whatever1', 'platform' => 'Mobile']);
    $wrong = $this->postJson('/api/login', ['email' => 'maria@school.test', 'password' => 'Whatever1', 'platform' => 'Mobile']);

    expect($unknown->status())->toBe($wrong->status())->toBe(301);
    expect($unknown->json())->toBe($wrong->json());
});

it('tells a deactivated account so only after the right password', function () {
    secPerson('Gone', 'gone@school.test', 'Secret123', false);

    $this->postJson('/api/login', ['email' => 'gone@school.test', 'password' => 'Wrong1234'])->assertStatus(301);
    $this->postJson('/api/login', ['email' => 'gone@school.test', 'password' => 'Secret123'])
        ->assertStatus(403)->assertJsonPath('authenticated', 'Account Deactivated');
});

it('a list or an object sent as the email or the password is a wrong login, not a server error', function () {
    secPerson('Maria', 'maria@school.test');

    $this->postJson('/api/login', ['email' => ['maria@school.test'], 'password' => 'Secret123'])->assertStatus(301);
    $this->postJson('/api/login', ['email' => 'maria@school.test', 'password' => ['Secret123']])->assertStatus(301);
    $this->postJson('/api/login', [])->assertStatus(301);
});

it('still logs in with the right password and writes the failed tries to the audit log', function () {
    $u = secPerson('Maria', 'maria@school.test');

    $this->postJson('/api/login', ['email' => 'maria@school.test', 'password' => 'bad', 'platform' => 'Mobile'])->assertStatus(301);
    $this->postJson('/api/login', ['email' => 'maria@school.test', 'password' => 'Secret123', 'platform' => 'Mobile'])
        ->assertStatus(201)->assertJsonPath('authenticated', 'Log in Success');

    expect(AuditLog::where('category', 'login')->where('status', 'failed')->where('user_id', $u->id)->count())->toBe(1);
});

// ---------- password change ----------

it('a password change ends every other session but keeps the one that made it', function () {
    $u = secPerson('Maria', 'maria@school.test');
    $phone = $u->createToken('Mobile')->plainTextToken;
    $other = $u->createToken('Mobile')->plainTextToken;

    bearer($this, $phone)->postJson('/api/changePassword', [
        'current_password' => 'Secret123', 'password' => 'Newer1234', 'password_confirmation' => 'Newer1234',
    ])->assertStatus(201);

    expect($u->tokens()->count())->toBe(1);
    bearer($this, $other)->getJson('/api/myLeaveBalance')->assertStatus(401);
});

// ---------- HR edits ----------

it('an employee edit changes the form fields but can not set a password, is_active or a duplicate email', function () {
    $hr = secHr();
    $emp = secPerson('Maria', 'maria@school.test');
    secPerson('Jose', 'jose@school.test');
    $oldHash = $emp->password;

    $this->actingAs($hr, 'sanctum')->putJson("/api/users/{$emp->id}", [
        'position' => 'Teacher II', 'password' => 'Hacked1234', 'is_active' => false, 'image_path' => 'x.png',
    ])->assertOk();

    $emp->refresh();
    expect($emp->position)->toBe('Teacher II');
    expect($emp->password)->toBe($oldHash);
    expect($emp->is_active)->toBeTrue();
    expect($emp->image_path)->toBeNull();

    $this->actingAs($hr, 'sanctum')->putJson("/api/users/{$emp->id}", ['email' => 'jose@school.test'])
        ->assertStatus(422)->assertJsonValidationErrors(['email']);
    $this->actingAs($hr, 'sanctum')->putJson("/api/users/{$emp->id}", ['email' => 'not an email'])
        ->assertStatus(422)->assertJsonValidationErrors(['email']);
    // the employee's own email, unchanged, is fine
    $this->actingAs($hr, 'sanctum')->putJson("/api/users/{$emp->id}", ['email' => 'maria@school.test'])->assertOk();
});

it('creating an employee with an email that is already used is a message, not a server error', function () {
    $hr = secHr();
    secPerson('Maria', 'maria@school.test');

    $this->actingAs($hr, 'sanctum')->postJson('/api/users', [
        'name' => 'Copy', 'email' => 'maria@school.test', 'contact_number' => '0917', 'department' => 'Academic', 'position' => 'Teacher',
        'call_time' => '07:30', 'contract_type' => 'Regular', 'employment_status' => 'Permanent', 'date_of_birth' => '1990-01-01',
        'gender' => 'Male', 'nationality' => 'Filipino', 'address' => 'Tarlac', 'monthly_salary' => 20000, 'working_hours_per_day' => 8,
    ])->assertStatus(422)->assertJsonValidationErrors(['email']);
});

it('a salary update changes only the pay figures, never the employee it belongs to', function () {
    $hr = secHr();
    $a = secPerson('Maria', 'maria@school.test');
    $b = secPerson('Jose', 'jose@school.test');
    $salary = Salary::create(['user_id' => $a->id, 'salary_basis' => 20000, 'working_hours_per_day' => 8, 'working_days_per_month' => 26]);

    $this->actingAs($hr, 'sanctum')->putJson("/api/salary/{$salary->id}", ['user_id' => $b->id, 'salary_basis' => 25000])->assertOk();

    $salary->refresh();
    expect($salary->user_id)->toBe($a->id);
    expect((float) $salary->salary_basis)->toBe(25000.0);

    $this->actingAs($hr, 'sanctum')->putJson("/api/salary/{$salary->id}", ['salary_basis' => 'a lot'])->assertStatus(422);
});

it('a leave balance update takes only whole credits and can not move the balance to another employee', function () {
    $hr = secHr();
    $a = secPerson('Maria', 'maria@school.test');
    $b = secPerson('Jose', 'jose@school.test');
    $bal = LeaveBalance::create(['user_id' => $a->id, 'sick' => 5, 'vacation' => 5, 'emergency' => 3, 'birthday' => 1, 'solo_parent' => 0, 'paternity' => 0, 'maternity' => 0]);

    $this->actingAs($hr, 'sanctum')->putJson("/api/balance/{$bal->id}", ['user_id' => $b->id, 'sick' => 4])->assertOk();
    expect($bal->fresh()->user_id)->toBe($a->id);
    expect($bal->fresh()->sick)->toBe(4);

    $this->actingAs($hr, 'sanctum')->putJson("/api/balance/{$bal->id}", ['sick' => -3])->assertStatus(422);
});

it('a location update is checked', function () {
    $hr = secHr();
    $place = Location::create(['name' => 'Gate', 'latitude' => 15.47, 'longitude' => 120.6, 'radius' => 30]);

    $this->actingAs($hr, 'sanctum')->putJson("/api/location/{$place->id}", ['latitude' => 999])->assertStatus(422);
    $this->actingAs($hr, 'sanctum')->putJson("/api/location/{$place->id}", ['radius' => 40])->assertOk();
});

it('the broken attendance update and delete, and the leftover test route, are gone', function () {
    $hr = secHr();

    // there is no such route any more (404; 405 would mean the path exists for another method)
    expect($this->actingAs($hr, 'sanctum')->putJson('/api/attendance/1', ['status' => 'Absent'])->status())->toBeIn([404, 405]);
    expect($this->actingAs($hr, 'sanctum')->deleteJson('/api/attendance/1')->status())->toBeIn([404, 405]);
    $this->actingAs($hr, 'sanctum')->getJson('/api/test')->assertStatus(404);
});

// ---------- clock-in position, checked on the server ----------

beforeEach(function () {
    Carbon::setTestNow(Carbon::parse('2026-10-21 08:00:00', 'Asia/Manila'));   // a Wednesday
});
afterEach(fn () => Carbon::setTestNow());

function secClockIn($test, array $body)
{
    SystemSetting::firstOrCreate([], []);
    $u = Users::where('email', 'maria@school.test')->first() ?? secPerson('Maria', 'maria@school.test');
    $token = $u->createToken('phone')->plainTextToken;

    return bearer($test, $token)->postJson('/api/clockIn', $body);
}

it('clocks in inside the work area', function () {
    Location::create(['name' => 'Main Gate', 'latitude' => 15.4709, 'longitude' => 120.6035, 'radius' => 50]);

    secClockIn($this, ['location_name' => 'Main Gate', 'userLat' => 15.4709, 'userLong' => 120.6035])->assertCreated();

    expect(Attendance::count())->toBe(1);
});

it('refuses a clock-in outside the work area, and writes it to the audit log', function () {
    Location::create(['name' => 'Main Gate', 'latitude' => 15.4709, 'longitude' => 120.6035, 'radius' => 50]);

    secClockIn($this, ['location_name' => 'Main Gate', 'userLat' => 15.4809, 'userLong' => 120.6035])   // about 1.1 km away
        ->assertStatus(403)->assertJsonPath('message', 'You are outside the designated work area.');

    expect(Attendance::count())->toBe(0);
    $log = AuditLog::where('action', 'clock_in')->where('status', 'failed')->sole();
    expect($log->description)->toContain('Out of range at Main Gate');
});

it('refuses a clock-in the phone says comes from a mock location', function () {
    Location::create(['name' => 'Main Gate', 'latitude' => 15.4709, 'longitude' => 120.6035, 'radius' => 50]);

    secClockIn($this, ['location_name' => 'Main Gate', 'userLat' => 15.4709, 'userLong' => 120.6035, 'mocked' => true])->assertStatus(403);

    expect(Attendance::count())->toBe(0);
    expect(AuditLog::where('action', 'clock_in')->where('status', 'failed')->sole()->description)->toContain('Mock location');
});

it('accepts a mock location only when the setting is switched off (for testing on an emulator)', function () {
    Location::create(['name' => 'Main Gate', 'latitude' => 15.4709, 'longitude' => 120.6035, 'radius' => 50]);
    expect(config('clockin.refuse_mock_location'))->toBeTrue();   // refused unless somebody switches it off

    config(['clockin.refuse_mock_location' => false]);
    secClockIn($this, ['location_name' => 'Main Gate', 'userLat' => 15.4709, 'userLong' => 120.6035, 'mocked' => true])->assertCreated();
});

it('a clock-in without a position, or for a place that does not exist, is refused with a message', function () {
    Location::create(['name' => 'Main Gate', 'latitude' => 15.4709, 'longitude' => 120.6035, 'radius' => 50]);

    secClockIn($this, ['location_name' => 'Main Gate'])->assertStatus(422)->assertJsonValidationErrors(['userLat', 'userLong']);
    secClockIn($this, ['location_name' => 'Nowhere', 'userLat' => 15.4709, 'userLong' => 120.6035])->assertStatus(422)->assertJsonValidationErrors(['location_name']);
    expect(Attendance::count())->toBe(0);
});

it('the geofence check answers bad input with a message, not a server error', function () {
    $u = secPerson('Maria', 'maria@school.test');

    $this->actingAs($u, 'sanctum')->postJson('/api/geofence', ['locationName' => 'Nowhere', 'userLat' => 1, 'userLong' => 1])->assertStatus(422);
    $this->actingAs($u, 'sanctum')->postJson('/api/geofence', [])->assertStatus(422);
});

// ---------- cross-origin pages and default passwords ----------

it('pages on localhost or the local network are not let in by CORS outside the local environment', function () {
    expect(app()->environment('local'))->toBeFalse();
    expect(config('cors.allowed_origins_patterns'))->toBe([]);
});

it('the seeder no longer creates the HR account with the published default password', function () {
    $this->seed(DatabaseSeeder::class);

    $hr = Users::where('email', 'hr@biogeohr.test')->sole();
    expect(Hash::check('password123', $hr->password))->toBeFalse();
});

it('the reset command finds the accounts with a known default password, and a dry run changes nothing', function () {
    $weak = secPerson('Weak', 'weak@school.test', 'password123');
    $strong = secPerson('Strong', 'strong@school.test', 'Tr1cky-Pass-9x');
    $token = $weak->createToken('phone');
    $oldHash = $weak->password;

    $this->artisan('accounts:reset-weak-passwords --dry-run')->expectsOutputToContain('1 account(s)')->assertSuccessful();
    expect($weak->fresh()->password)->toBe($oldHash);

    $this->artisan('accounts:reset-weak-passwords')->assertSuccessful();

    expect(Hash::check('password123', $weak->fresh()->password))->toBeFalse();
    expect($weak->tokens()->count())->toBe(0);                                  // logged out everywhere
    expect(Hash::check('Tr1cky-Pass-9x', $strong->fresh()->password))->toBeTrue();   // an account that is fine is not touched
    expect(AuditLog::where('action', 'password_reset')->where('user_id', $weak->id)->count())->toBe(1);
});
