<?php

use App\Models\Users;
use App\Rules\StrongPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

uses(RefreshDatabase::class);

const PASSWORD_MESSAGE = 'Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number.';

beforeEach(function () {
    $this->hr = Users::create([
        'name' => 'Test HR', 'email' => 'hr@test.test', 'contact_number' => '0917', 'password' => 'OldPass123',
        'department' => 'Administrative', 'position' => 'HR Administrator', 'call_time' => '08:00:00',
        'contract_type' => 'Regular', 'date_of_birth' => '1990-01-01', 'gender' => 'Other',
        'nationality' => 'Filipino', 'address' => 'Tarlac', 'employment_status' => 'Permanent', 'is_active' => true,
    ]);
});

// the form no longer has a password: HR sends everything else
function employeeBody(array $extra = []): array
{
    return $extra + [
        'name' => 'Pw Test', 'email' => 'pw' . uniqid() . '@test.test', 'contact_number' => '0917 123 4567',
        'department' => 'Academic', 'position' => 'Teacher', 'call_time' => '07:30:00',
        'contract_type' => 'Regular', 'employment_status' => 'Permanent', 'date_of_birth' => '1990-01-01',
        'gender' => 'Male', 'nationality' => 'Filipino', 'address' => 'Tarlac',
        'monthly_salary' => 20000, 'working_hours_per_day' => 8,
    ];
}

// the password in the welcome email that the (array) mailer kept
function emailedPassword(): ?string
{
    $message = Mail::mailer()->getSymfonyTransport()->messages()->last();

    return $message && preg_match('/Password: (\S+)/', $message->getOriginalMessage()->getTextBody(), $m) ? $m[1] : null;
}

// ---------- HR creating an employee: the server makes and emails the password ----------

it('create employee: no password is needed, a random one is emailed and it is the one that works', function () {
    $response = $this->actingAs($this->hr, 'sanctum')->postJson('/api/users', employeeBody())
        ->assertCreated()
        ->assertJsonPath('email_sent', true)
        ->assertJsonPath('temporary_password', null);   // not shown to HR when the email went out

    $emailed = emailedPassword();
    expect($emailed)->not->toBeNull();
    expect(Hash::check($emailed, Users::find($response->json('id'))->password))->toBeTrue();
    expect(Validator::make(['p' => $emailed], ['p' => [new StrongPassword]])->passes())->toBeTrue();
});

it('create employee: a password sent by the client is ignored', function () {
    $response = $this->actingAs($this->hr, 'sanctum')->postJson('/api/users', employeeBody(['password' => 'abc']))->assertCreated();

    expect(Hash::check('abc', Users::find($response->json('id'))->password))->toBeFalse();
});

it('create employee: two employees never get the same password', function () {
    $this->actingAs($this->hr, 'sanctum')->postJson('/api/users', employeeBody())->assertCreated();
    $first = emailedPassword();
    $this->actingAs($this->hr, 'sanctum')->postJson('/api/users', employeeBody())->assertCreated();

    expect(emailedPassword())->not->toBe($first);
});

it('create employee: when the email cannot be sent, HR is given the password once', function () {
    Mail::shouldReceive('raw')->once()->andThrow(new RuntimeException('smtp down'));

    $response = $this->actingAs($this->hr, 'sanctum')->postJson('/api/users', employeeBody())
        ->assertCreated()
        ->assertJsonPath('email_sent', false);

    $shown = $response->json('temporary_password');
    expect($shown)->toBeString();
    expect(Hash::check($shown, Users::find($response->json('id'))->password))->toBeTrue();
});

it('generated passwords always meet the rule and are easy to read', function () {
    foreach (range(1, 300) as $i) {
        $p = StrongPassword::generate();

        expect(strlen($p))->toBe(10);
        expect(Validator::make(['p' => $p], ['p' => [new StrongPassword]])->passes())->toBeTrue();
        expect($p)->not->toMatch('/[O0Il1]/');   // no look-alike characters
    }
});

// ---------- an employee changing their own password ----------

it('change password: a weak new password is rejected and the old one stays', function (string $weak) {
    $this->actingAs($this->hr, 'sanctum')->postJson('/api/changePassword', [
        'current_password' => 'OldPass123', 'password' => $weak, 'password_confirmation' => $weak,
    ])->assertUnprocessable()->assertJsonPath('errors.password.0', PASSWORD_MESSAGE);

    expect(Hash::check('OldPass123', $this->hr->fresh()->password))->toBeTrue();
})->with([
    'too short'    => ['Ab1cdef'],       // 7 characters
    'no number'    => ['Abcdefgh'],
    'no uppercase' => ['abcdefg1'],
    'no lowercase' => ['ABCDEFG1'],
    'only digits'  => ['12345678'],
    'password123'  => ['password123'],   // no uppercase
]);

it('change password: a good new password is saved, a symbol is optional', function (string $good) {
    $this->actingAs($this->hr, 'sanctum')->postJson('/api/changePassword', [
        'current_password' => 'OldPass123', 'password' => $good, 'password_confirmation' => $good,
    ])->assertCreated();

    expect(Hash::check($good, $this->hr->fresh()->password))->toBeTrue();
})->with([
    'exactly 8'     => ['Abcdef1g'],
    'with a symbol' => ['Abcdef1!'],
    'long'          => ['SchoolYear2026Teacher'],
]);
