<?php

use App\Models\Users;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\PersonalAccessToken;

uses(RefreshDatabase::class);

const JSON_ACCEPT = ['HTTP_ACCEPT' => 'application/json'];

beforeEach(function () {
    // HR: the website only lets HR in
    $this->user = Users::create([
        'name' => 'Cookie', 'email' => 'cookie@test.test', 'contact_number' => '0917', 'password' => 'Secret123',
        'department' => 'Administrative', 'position' => 'HR Administrator', 'call_time' => '07:30:00',
        'contract_type' => 'Regular', 'date_of_birth' => '1990-01-01', 'gender' => 'Male',
        'nationality' => 'Filipino', 'address' => 'Tarlac', 'employment_status' => 'Permanent', 'is_active' => true,
    ]);
});

function login(string $platform, string $email = 'cookie@test.test')
{
    return test()->postJson('/api/login', ['email' => $email, 'password' => 'Secret123', 'platform' => $platform]);
}

function tokenCookie($response)
{
    return collect($response->headers->getCookies())->first(fn ($c) => $c->getName() === 'token');
}

// a request the way a browser sends it: the cookie only, no Authorization header
function withCookie(string $method, string $uri, string $token, array $server = [])
{
    app('auth')->forgetGuards();

    return test()->call($method, $uri, [], ['token' => $token], [], $server + JSON_ACCEPT);
}

// ---------- login and logout ----------

it('a web login sets an HttpOnly, Secure, SameSite=None token cookie (the site and the API are on different domains)', function () {
    $cookie = tokenCookie(login('web')->assertStatus(201));

    expect($cookie)->not->toBeNull();
    expect($cookie->isHttpOnly())->toBeTrue();
    expect($cookie->isSecure())->toBeTrue();
    expect($cookie->getSameSite())->toBe('none');
});

it('a mobile login gets no cookie, and gets the token in the body', function () {
    $response = login('mobile')->assertStatus(201);

    expect(tokenCookie($response))->toBeNull();
    expect($response->json('token'))->toBeString();
});

it('a web login by HR gets the cookie and no token in the body', function () {
    $response = login('web')->assertStatus(201);

    expect($response->json())->not->toHaveKey('token');
    expect(tokenCookie($response))->not->toBeNull();
});

it('a web login by a non-HR employee gets no cookie (the website refuses them)', function () {
    Users::create([
        'name' => 'Teacher', 'email' => 'teacher@test.test', 'contact_number' => '0917', 'password' => 'Secret123',
        'department' => 'Academic', 'position' => 'Teacher', 'call_time' => '07:30:00',
        'contract_type' => 'Regular', 'date_of_birth' => '1990-01-01', 'gender' => 'Male',
        'nationality' => 'Filipino', 'address' => 'Tarlac', 'employment_status' => 'Permanent', 'is_active' => true,
    ]);

    expect(tokenCookie(login('web', 'teacher@test.test')->assertStatus(201)))->toBeNull();
});

it('logout deletes the token and clears the cookie', function () {
    $token = tokenCookie(login('web'))->getValue();

    app('auth')->forgetGuards();
    $logout = test()->call('POST', '/api/logout', [], ['token' => $token], [], ['HTTP_X_REQUESTED_WITH' => 'XMLHttpRequest'] + JSON_ACCEPT);

    $logout->assertOk();
    expect(tokenCookie($logout)->isCleared())->toBeTrue();   // an expired cookie: the browser removes it
    expect(PersonalAccessToken::count())->toBe(0);
});

// ---------- the cookie logs the website in ----------

it('a request with only the cookie is authenticated', function () {
    $token = tokenCookie(login('web'))->getValue();

    withCookie('GET', '/api/profile', $token)->assertOk()->assertJsonPath('email', 'cookie@test.test');
});

it('no cookie and no header is still 401', function () {
    test()->getJson('/api/profile')->assertUnauthorized();
});

it('a wrong cookie is 401', function () {
    withCookie('GET', '/api/profile', '1|notarealtoken')->assertUnauthorized();
});

// ---------- CSRF: a cookie-only request that changes data needs X-Requested-With ----------

it('a cookie-only POST without X-Requested-With is refused', function () {
    $token = tokenCookie(login('web'))->getValue();

    withCookie('POST', '/api/clockIn/gpsOff', $token)->assertStatus(419);
});

it('a cookie-only POST with X-Requested-With goes through', function () {
    $token = tokenCookie(login('web'))->getValue();

    withCookie('POST', '/api/clockIn/gpsOff', $token, ['HTTP_X_REQUESTED_WITH' => 'XMLHttpRequest'])->assertNoContent();
});

it('a read does not need the header', function () {
    $token = tokenCookie(login('web'))->getValue();

    withCookie('GET', '/api/profile', $token)->assertOk();
});

it('the phone, which sends the token as a header, never needs X-Requested-With', function () {
    $token = login('mobile')->json('token');   // HR logging in on the phone gets the token in the body

    app('auth')->forgetGuards();
    test()->call('POST', '/api/clockIn/gpsOff', [], [], [], ['HTTP_AUTHORIZATION' => "Bearer {$token}"] + JSON_ACCEPT)->assertNoContent();
});
