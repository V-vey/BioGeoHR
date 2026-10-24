<?php

use App\Models\AuditLog;
use App\Models\LeaveApplication;
use App\Models\LeaveBalance;
use App\Models\Users;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// A leave request that is still Pending after its first day has passed is rejected by the system, with a
// note saying so. A request filed after its own start date (a sick day reported later) is left for HR.

function leavePerson(string $name, string $email, string $dept = 'Academic', string $pos = 'Teacher'): Users
{
    return Users::create([
        'name' => $name, 'email' => $email, 'contact_number' => '0917', 'password' => 'x',
        'department' => $dept, 'position' => $pos, 'call_time' => '07:30:00',
        'contract_type' => 'Regular', 'date_of_birth' => '1990-01-01', 'gender' => 'Male',
        'nationality' => 'Filipino', 'address' => 'Tarlac', 'employment_status' => 'Permanent', 'is_active' => true,
    ]);
}

beforeEach(function () {
    Carbon::setTestNow(Carbon::parse('2026-10-20 09:00:00', 'Asia/Manila'));   // the day the request is filed
    $this->hr = leavePerson('Test HR', 'hr@test.test', 'Administrative', 'HR Administrator');
    $this->emp = leavePerson('Maria Santos', 'maria@school.test');
    $this->balance = LeaveBalance::create([
        'user_id' => $this->emp->id, 'sick' => 5, 'vacation' => 5, 'emergency' => 3, 'birthday' => 1,
        'solo_parent' => 0, 'paternity' => 0, 'maternity' => 0,
    ]);
});

afterEach(fn () => Carbon::setTestNow());

function fileLeave($test, string $start, string $end = null): LeaveApplication
{
    return LeaveApplication::create([
        'user_id' => $test->emp->id, 'leave_balance_id' => $test->balance->id, 'leave_type' => 'Vacation Leave',
        'start_date' => $start, 'end_date' => $end ?? $start, 'reason' => 'Family matter', 'status' => 'Pending',
    ]);
}

function hrReads($test)
{
    return $test->actingAs($test->hr, 'sanctum')->getJson('/api/leave')->assertOk();
}

it('rejects a pending request on the next read once its start date has passed', function () {
    $leave = fileLeave($this, '2026-10-22');
    Carbon::setTestNow(Carbon::parse('2026-10-23 08:00:00', 'Asia/Manila'));

    hrReads($this);

    $leave->refresh();
    expect($leave->status)->toBe('Rejected');
    expect($leave->remarks)->toBe(LeaveApplication::AUTO_REJECT_NOTE);
    expect($this->balance->fresh()->vacation)->toBe(5);       // nothing was ever taken from the balance
});

it('leaves a request alone on its start date, and until the day after', function () {
    $leave = fileLeave($this, '2026-10-22');

    Carbon::setTestNow(Carbon::parse('2026-10-21 08:00:00', 'Asia/Manila'));
    hrReads($this);
    expect($leave->fresh()->status)->toBe('Pending');

    Carbon::setTestNow(Carbon::parse('2026-10-22 23:30:00', 'Asia/Manila'));   // still the start date
    hrReads($this);
    expect($leave->fresh()->status)->toBe('Pending');

    Carbon::setTestNow(Carbon::parse('2026-10-23 00:05:00', 'Asia/Manila'));   // the day after
    hrReads($this);
    expect($leave->fresh()->status)->toBe('Rejected');
});

it('leaves a request that was filed after its own start date for HR to decide', function () {
    $leave = fileLeave($this, '2026-10-18');   // filed on the 20th for the 18th: a sick day reported late

    hrReads($this);

    expect($leave->fresh()->status)->toBe('Pending');
});

it('does not touch a request that was already approved or rejected', function () {
    $approved = fileLeave($this, '2026-10-22');
    $approved->update(['status' => 'Approved', 'remarks' => 'OK']);
    $rejected = fileLeave($this, '2026-10-22');
    $rejected->update(['status' => 'Rejected', 'remarks' => 'No cover']);
    Carbon::setTestNow(Carbon::parse('2026-10-25 08:00:00', 'Asia/Manila'));

    hrReads($this);

    expect($approved->fresh()->status)->toBe('Approved');
    expect($approved->fresh()->remarks)->toBe('OK');
    expect($rejected->fresh()->remarks)->toBe('No cover');    // HR's own note is not replaced
});

it('the employee\'s own list shows it as rejected too, so the phone does not wait for HR to open the page', function () {
    $leave = fileLeave($this, '2026-10-22');
    Carbon::setTestNow(Carbon::parse('2026-10-23 08:00:00', 'Asia/Manila'));
    $token = $this->emp->createToken('phone')->plainTextToken;

    $rows = $this->getJson('/api/myLeave', ['Authorization' => 'Bearer ' . $token])->assertOk()->json();

    expect($rows[0]['status'])->toBe('Rejected');
    expect($rows[0]['remarks'])->toBe(LeaveApplication::AUTO_REJECT_NOTE);
});

it('writes one audit entry for the employee, even when the list is read twice', function () {
    $leave = fileLeave($this, '2026-10-22');
    Carbon::setTestNow(Carbon::parse('2026-10-23 08:00:00', 'Asia/Manila'));

    hrReads($this);
    hrReads($this);

    $log = AuditLog::where('action', 'leave_auto_rejected')->sole();
    expect($log->category)->toBe('leave');
    expect($log->user_id)->toBe($this->emp->id);
    expect($log->description)->toContain("Leave #{$leave->id}");
});

it('HR cannot approve a request that expired while the page was open', function () {
    $leave = fileLeave($this, '2026-10-22');
    Carbon::setTestNow(Carbon::parse('2026-10-23 08:00:00', 'Asia/Manila'));

    $this->actingAs($this->hr, 'sanctum')->putJson("/api/leave/{$leave->id}", ['status' => 'Approved'])
        ->assertStatus(422)
        ->assertJsonPath('message', 'The leave date has already passed, so this request was rejected automatically.');

    expect($leave->fresh()->status)->toBe('Rejected');
    expect($this->balance->fresh()->vacation)->toBe(5);       // the days were not taken
});

it('HR can still approve a request that is on time', function () {
    $leave = fileLeave($this, '2026-10-22', '2026-10-23');

    $this->actingAs($this->hr, 'sanctum')->putJson("/api/leave/{$leave->id}", ['status' => 'Approved'])->assertOk();

    expect($leave->fresh()->status)->toBe('Approved');
    expect($this->balance->fresh()->vacation)->toBe(3);       // 2 days
});
