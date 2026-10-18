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

    //checking password
    public function checkPassword($request){ //Check The Password
        if (Hash::check($request->password, $this->password)){

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
        AuditLog::record('login', 'login', 'failed', $this->label('Wrong Credential'), $this->user->id, $this->user->email);
        //Wrong password
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
        $this->user = Users::where("email", $request->email)->first();
        
        if (!$this->user){ 
            AuditLog::record('login', 'login', 'failed', $this->label('Wrong Credential'), null, $request->email);
            return response()->json([
                'authenticated' => 'User Not Found'
            ], 300);
        }
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

        return response()->json([
            'message' => 'Logged out'
        ])->cookie('token', '', -2628000, '/', null, true, true, false, 'none');   // expired, with the same SameSite=None as the login, or a cross-site browser ignores it
    }
}