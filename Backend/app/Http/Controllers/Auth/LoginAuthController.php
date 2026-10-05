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

    //checking password
    public function checkPassword($request){ //Check The Password
        if (Hash::check($request->password, $this->password)){

            $token = $this->user->createToken('Mobile')->plainTextToken;
            AuditLog::record('login', 'login', 'success', null, $this->user->id, $this->user->email);
            return response()->json([
                'authenticated' => "Log in Success",
                'user' => $this->user->isHR() ? 'HR' : 'Employee',
                'token' => $token
            ], 201);
        }
        AuditLog::record('login', 'login', 'failed', 'Wrong password', $this->user->id, $this->user->email);
        //Wrong password
        return response()->json(['authenticated' => 'Password Incorrect'], 301);
    }
    //authenticate
    public function auth(Request $request){
        $this->user = Users::where("email", $request->email)->first();
        
        if (!$this->user){ 
            AuditLog::record('login', 'login', 'failed', 'Unknown email', null, $request->email);
            return response()->json([
                'authenticated' => 'User Not Found'
            ], 300);
        }
        if (!$this->user->is_active) {
            AuditLog::record('login', 'login', 'failed', 'Account deactivated', $this->user->id, $this->user->email);
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
        ]);
    }
}