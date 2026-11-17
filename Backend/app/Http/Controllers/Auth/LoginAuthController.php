<?php

namespace App\Http\Controllers\Auth;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Users;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use App\Models\AuditLog;

class LoginAuthController extends Controller{

    protected $user;
    protected $email; 
    protected $password;
    protected $platform;   // 'Web' or 'Mobile' (null when it cannot be told)
    protected $passwordOk = false;

    // a real bcrypt hash that matches nothing, checked when the email does not exist so that an unknown email
    // takes as long to answer as a wrong password
    private const NO_ACCOUNT_HASH = '$2y$12$usesomesillystringfore7hnbRJHxXVLeakoG8K30oukPsA.ztMG';

    //checking password
    public function checkPassword($request){ //Check The Password
        if ($this->passwordOk){

            $token = $this->user->createToken($this->platform ?? 'Mobile')->plainTextToken;
            AuditLog::record('login', 'login', 'success', $this->platform ? "Logged in via {$this->platform}" : null, $this->user->id, $this->user->email);

            // the website keeps the login in an HttpOnly cookie and never sees the token; the phone gets it in the body
            $isWebHR = $this->platform === 'Web' && $this->user->isHR();   // the website only lets HR in
            $response = response()->json([
                'authenticated' => "Log in Success",
                'user' => $this->user->isHR() ? 'HR' : 'Employee',
            ] + ($isWebHR ? [] : ['token' => $token]), 201);

            if ($isWebHR) {
                // name, value, minutes, path, domain, secure, httpOnly, raw, sameSite
                // SameSite=None because the website and the API are on different domains (the site on
                // localhost or a dev tunnel, the API on ngrok): with Lax the browser never sends the cookie
                // back and every request after the login is a 401. None needs Secure. The CSRF check
                // (X-Requested-With + CORS) is what protects the cookie.
                $response->cookie('token', $token, 60 * 8, '/', null, true, true, false, 'none');
            }

            return $response;
        }
        // not reached: auth() only calls this after the password was right
        return $this->wrongCredential();
    }

    /** The same answer for an email that does not exist and for a wrong password, so the login does not tell which emails are real. */
    private function wrongCredential()
    {
        return response()->json(['authenticated' => 'Password Incorrect'], 301);
    }
    /**
     * Where the login came from. The web page and the phone app send `platform`; an older phone app
     * does not, so then the app's own identifier decides (Flutter says "Dart", browsers say "Mozilla").
     */
    private function platformOf(Request $request): ?string
    {
        $sent = strtolower((string) $request->input('platform'));
        if ($sent === 'web') return 'Web';
        if ($sent === 'mobile') return 'Mobile';

        $agent = strtolower((string) $request->userAgent());
        if (str_contains($agent, 'dart')) return 'Mobile';
        if (str_contains($agent, 'mozilla')) return 'Web';
        return null;
    }

    /** "Wrong password (Web)": the reason, with where it happened when that is known. */
    private function label(string $reason): string
    {
        return $this->platform ? "{$reason} ({$this->platform})" : $reason;
    }

    //authenticate
    public function auth(Request $request){
        $this->platform = $this->platformOf($request);

        // only text is accepted: a list or an object sent as the email or the password is the same as nothing
        $email = is_string($request->input('email')) ? trim($request->input('email')) : '';
        $password = is_string($request->input('password')) ? $request->input('password') : '';

        $this->user = $email === '' ? null : Users::where("email", $email)->first();

        // the password is checked first, also for an email that does not exist (against a hash that matches nothing)
        $this->passwordOk = Hash::check($password, $this->user?->password ?? self::NO_ACCOUNT_HASH) && $this->user !== null;

        if (!$this->user || !$this->passwordOk) {
            AuditLog::record('login', 'login', 'failed', $this->label('Wrong Credential'), $this->user?->id, $email !== '' ? $email : null);
            return $this->wrongCredential();
        }
        // a deactivated account is only told so after the right password, so the answer does not reveal who has an account
        if (!$this->user->is_active) {
            AuditLog::record('login', 'login', 'failed', $this->label('Account deactivated'), $this->user->id, $this->user->email);
            return response()->json(['authenticated' => 'Account Deactivated'], 403);
        }
        //This email = to authenticated user not the request
        $this->email = $this->user->email;
        $this->password = $this->user->password;  
        
        return $this->checkPassword($request);   
    }

    //log out
    public function logout(Request $request){
        $request->user()->currentAccessToken()->delete();
        AuditLog::record('login', 'logout', 'success', null, $request->user()->id, $request->user()->email);

        return response()->json([
            'message' => 'Logged out'
        ])->cookie('token', '', -2628000, '/', null, true, true, false, 'none');   // expired, with the same SameSite=None as the login, or a cross-site browser ignores it
    }
}