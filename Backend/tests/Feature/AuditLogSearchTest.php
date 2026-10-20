<?php

use App\Models\AuditLog;
use App\Models\Users;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function auditPerson(string $name, string $email, string $dept = 'Academic', string $pos = 'Teacher'): Users
{
    return Users::create([
        'name' => $name, 'email' => $email, 'contact_number' => '0917', 'password' => 'x',
        'department' => $dept, 'position' => $pos, 'call_time' => '07:30:00',
        'contract_type' => 'Regular', 'date_of_birth' => '1990-01-01', 'gender' => 'Male',
        'nationality' => 'Filipino', 'address' => 'Tarlac', 'employment_status' => 'Permanent', 'is_active' => true,
    ]);
}

function searchLogs($test, array $query): array
{
    return $test->actingAs($test->hr, 'sanctum')->getJson('/api/audit-logs?' . http_build_query($query))
        ->assertOk()->json('data');
}

beforeEach(function () {
    $this->hr = auditPerson('Test HR', 'hr@test.test', 'Administrative', 'HR Administrator');
    $this->maria = auditPerson('Maria Santos', 'maria@school.test');
    $this->jose = auditPerson('Jose Dela Cruz', 'jose@school.test');

    AuditLog::create(['user_id' => $this->maria->id, 'category' => 'check_in', 'action' => 'clock_in', 'status' => 'success']);
    AuditLog::create(['user_id' => $this->maria->id, 'category' => 'login', 'action' => 'login', 'status' => 'success']);
    AuditLog::create(['user_id' => $this->jose->id, 'category' => 'check_in', 'action' => 'clock_in', 'status' => 'failed']);
    AuditLog::create(['user_id' => null, 'email' => 'stranger@nowhere.test', 'category' => 'login', 'action' => 'login', 'status' => 'failed']);
});

it('finds a user\'s entries by part of the name, in any letter case', function () {
    $rows = searchLogs($this, ['search' => 'mari']);
    expect($rows)->toHaveCount(2);
    expect(collect($rows)->pluck('user.name')->unique()->all())->toBe(['Maria Santos']);

    expect(searchLogs($this, ['search' => 'DELA CRUZ']))->toHaveCount(1);
});

it('finds entries by the user\'s email, and a failed login by the email that was typed', function () {
    expect(searchLogs($this, ['search' => 'jose@school']))->toHaveCount(1);

    $typed = searchLogs($this, ['search' => 'stranger@nowhere']);   // no user behind it, only the typed email
    expect($typed)->toHaveCount(1);
    expect($typed[0]['status'])->toBe('failed');
});

it('returns everything for an empty search, and nothing for a name nobody has', function () {
    expect(searchLogs($this, ['search' => '']))->toHaveCount(4);
    expect(searchLogs($this, ['search' => '   ']))->toHaveCount(4);
    expect(searchLogs($this, ['search' => 'nobody-by-this-name']))->toHaveCount(0);
});

it('% and _ typed in the search are plain characters, not wildcards', function () {
    expect(searchLogs($this, ['search' => '%']))->toHaveCount(0);
    expect(searchLogs($this, ['search' => 'm_ria']))->toHaveCount(0);
});

it('the search works together with the other filters', function () {
    $rows = searchLogs($this, ['search' => 'maria', 'category' => 'login']);
    expect($rows)->toHaveCount(1);
    expect($rows[0]['action'])->toBe('login');

    expect(searchLogs($this, ['search' => 'jose', 'status' => 'success']))->toHaveCount(0);
});
