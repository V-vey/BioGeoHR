<?php

use App\Models\AuditLog;
use App\Models\LeaveBalance;
use App\Models\Loan;
use App\Models\Location;
use App\Models\Salary;
use App\Models\Users;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// Everything that changes data, or is security-relevant, leaves an audit entry: who, what, and never a secret.

function covPerson(string $name, string $email, string $dept = 'Academic', string $pos = 'Teacher'): Users
{
    return Users::create([
        'name' => $name, 'email' => $email, 'contact_number' => '09171234567', 'password' => 'Secret123',
        'department' => $dept, 'position' => $pos, 'call_time' => '07:30:00',
        'contract_type' => 'Regular', 'date_of_birth' => '1990-01-01', 'gender' => 'Male',
        'nationality' => 'Filipino', 'address' => 'Tarlac', 'employment_status' => 'Permanent', 'is_active' => true,
    ]);
}

function covBearer($test, string $token)
{
    app('auth')->forgetGuards();

    return $test->withHeader('Authorization', 'Bearer ' . $token);
}

function entry(string $action): AuditLog
{
    return AuditLog::where('action', $action)->latest('id')->firstOrFail();
}

beforeEach(function () {
    Carbon::setTestNow(Carbon::parse('2026-10-21 10:00:00', 'Asia/Manila'));   // a Wednesday
    $this->hr = covPerson('Test HR', 'hr@test.test', 'Administrative', 'HR Administrator');
    $this->emp = covPerson('Maria Santos', 'maria@school.test');
});

afterEach(fn () => Carbon::setTestNow());

it('logs a password change, how many sessions it ended, and never the password', function () {
    $phone = $this->emp->createToken('Mobile')->plainTextToken;
    $this->emp->createToken('Mobile');   // another session, ended by the change

    covBearer($this, $phone)->postJson('/api/changePassword', [
        'current_password' => 'Secret123', 'password' => 'Newer1234', 'password_confirmation' => 'Newer1234',
    ])->assertStatus(201);

    $log = entry('password_changed');
    expect($log->category)->toBe('login');
    expect($log->user_id)->toBe($this->emp->id);
    expect($log->description)->toContain('1 other session(s) ended');
    expect(AuditLog::where('description', 'like', '%Newer1234%')->orWhere('description', 'like', '%Secret123%')->count())->toBe(0);
});

it('logs a logout', function () {
    $token = $this->emp->createToken('Mobile')->plainTextToken;

    covBearer($this, $token)->postJson('/api/logout')->assertOk();

    $log = entry('logout');
    expect($log->category)->toBe('login');
    expect($log->user_id)->toBe($this->emp->id);
});

it('logs a loan being edited, manually deducted and deleted', function () {
    Salary::create(['user_id' => $this->emp->id, 'salary_basis' => 20000, 'working_hours_per_day' => 8, 'working_days_per_month' => 26]);
    $loan = Loan::create([
        'user_id' => $this->emp->id, 'loan_type' => 'SSS', 'total_amount' => 10000, 'monthly_deduction' => 1000,
        'cutoff' => 'first', 'remaining_balance' => 10000, 'start_date' => '2026-10-01', 'status' => 'Active',
    ]);

    $this->actingAs($this->hr, 'sanctum')->putJson("/api/loans/{$loan->id}", ['monthly_deduction' => 800])->assertOk();
    expect(entry('loan_updated')->description)->toContain("Loan #{$loan->id}")->toContain('monthly_deduction');
    expect(entry('loan_updated')->user_id)->toBe($this->hr->id);

    $this->actingAs($this->hr, 'sanctum')->postJson("/api/loans/{$loan->id}/deduct")->assertOk();
    expect(entry('loan_deducted')->description)->toContain("Loan #{$loan->id}")->toContain('800');

    $this->actingAs($this->hr, 'sanctum')->deleteJson("/api/loans/{$loan->id}")->assertOk();
    expect(entry('loan_deleted')->description)->toContain("Loan #{$loan->id}")->toContain('SSS');
});

it('logs a geofence place being added, changed and deleted', function () {
    $id = $this->actingAs($this->hr, 'sanctum')->postJson('/api/location', [
        'name' => 'Side Gate', 'latitude' => 15.4709, 'longitude' => 120.6035, 'radius' => 30,
    ])->assertCreated()->json('id');
    expect(entry('location_added')->description)->toContain('Side Gate')->toContain('30');

    $this->actingAs($this->hr, 'sanctum')->putJson("/api/location/{$id}", ['radius' => 45])->assertOk();
    expect(entry('location_updated')->description)->toContain('Side Gate')->toContain('radius now 45');

    $this->actingAs($this->hr, 'sanctum')->deleteJson("/api/location/{$id}")->assertOk();
    expect(entry('location_deleted')->description)->toBe('Side Gate');
});

it('logs a salary record being created and deleted, without the amount', function () {
    $id = $this->actingAs($this->hr, 'sanctum')->postJson('/api/salary', [
        'user_id' => $this->emp->id, 'salary_basis' => 25000, 'working_hours_per_day' => 8, 'working_days_per_month' => 26,
    ])->assertCreated()->json('id');
    expect(entry('salary_created')->description)->toContain("Salary record #{$id}")->not->toContain('25000');

    $this->actingAs($this->hr, 'sanctum')->deleteJson("/api/salary/{$id}")->assertOk();
    expect(entry('salary_deleted')->description)->toContain("Salary record #{$id}");
});

it('logs a leave balance being changed and deleted', function () {
    $bal = LeaveBalance::create(['user_id' => $this->emp->id, 'sick' => 5, 'vacation' => 5, 'emergency' => 3, 'birthday' => 1, 'solo_parent' => 0, 'paternity' => 0, 'maternity' => 0]);

    $this->actingAs($this->hr, 'sanctum')->putJson("/api/balance/{$bal->id}", ['sick' => 2])->assertOk();
    expect(entry('leave_balance_updated')->description)->toContain("Leave balance #{$bal->id}")->toContain('sick');

    $this->actingAs($this->hr, 'sanctum')->deleteJson("/api/balance/{$bal->id}")->assertOk();
    expect(entry('leave_balance_deleted')->description)->toContain("Leave balance #{$bal->id}");
});

it('logs an employee applying for leave, and HR deleting a request', function () {
    LeaveBalance::create(['user_id' => $this->emp->id, 'sick' => 5, 'vacation' => 5, 'emergency' => 3, 'birthday' => 1, 'solo_parent' => 0, 'paternity' => 0, 'maternity' => 0]);
    $token = $this->emp->createToken('Mobile')->plainTextToken;

    covBearer($this, $token)->postJson('/api/applyLeave', [
        'leave_type' => 'Vacation Leave', 'start_date' => '2026-11-02', 'end_date' => '2026-11-03', 'reason' => 'Family matter',
    ])->assertOk();

    $applied = entry('leave_requested');
    expect($applied->category)->toBe('leave');
    expect($applied->user_id)->toBe($this->emp->id);
    expect($applied->description)->toContain('Vacation Leave')->toContain('2 day(s)');
    expect($applied->description)->not->toContain('Family matter');    // the reason is the employee's private text

    $leaveId = App\Models\LeaveApplication::sole()->id;
    $this->actingAs($this->hr, 'sanctum')->deleteJson("/api/leave/{$leaveId}")->assertOk();
    expect(entry('leave_deleted')->description)->toContain("Leave #{$leaveId}");
});

it('logs the absences that were marked automatically, and nothing when there were none', function () {
    $this->emp->forceFill(['created_at' => '2026-09-01 08:00:00'])->save();
    Salary::create(['user_id' => $this->emp->id, 'salary_basis' => 20000, 'working_hours_per_day' => 8, 'working_days_per_month' => 26]);

    $this->actingAs($this->hr, 'sanctum')->postJson('/api/attendance/sync-absences')->assertOk();
    $first = entry('absences_marked');
    expect($first->description)->toContain('absent record(s) created');

    $this->actingAs($this->hr, 'sanctum')->postJson('/api/attendance/sync-absences')->assertOk();   // nothing new to mark
    expect(AuditLog::where('action', 'absences_marked')->count())->toBe(1);
});

it('logs the login lockout once, not once for every refused try', function () {
    foreach (range(1, 8) as $i) {
        $this->postJson('/api/login', ['email' => 'maria@school.test', 'password' => "wrong{$i}", 'platform' => 'Mobile']);
    }

    expect(AuditLog::where('action', 'login_locked')->count())->toBe(1);
    $log = entry('login_locked');
    expect($log->category)->toBe('login');
    expect($log->status)->toBe('failed');
    expect($log->email)->toBe('maria@school.test');
    // the five real wrong passwords are logged as before, and none of the guesses is written down
    expect(AuditLog::where('action', 'login')->where('status', 'failed')->count())->toBe(5);
    foreach (range(1, 8) as $i) {
        expect(AuditLog::where('description', 'like', "%wrong{$i}%")->count())->toBe(0);
    }
});

it('logs an employee being refused an HR page, once a minute for the same page', function () {
    $token = $this->emp->createToken('Mobile')->plainTextToken;

    covBearer($this, $token)->getJson('/api/users')->assertStatus(403);
    covBearer($this, $token)->getJson('/api/users')->assertStatus(403);   // the same page again within the minute
    covBearer($this, $token)->getJson('/api/payslips/periods')->assertStatus(403);   // another page

    expect(AuditLog::where('action', 'access_denied')->count())->toBe(2);
    $log = AuditLog::where('action', 'access_denied')->orderBy('id')->first();
    expect($log->user_id)->toBe($this->emp->id);
    expect($log->status)->toBe('failed');
    expect($log->description)->toContain('GET /api/users')->toContain('HR role');
});
