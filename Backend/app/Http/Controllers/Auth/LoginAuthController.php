<?php

namespace App\Http\Controllers\Auth;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Users;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class LoginAuthController extends Controller{

    protected $user;
    protected $email; 
    protected $password;

    //checking password
    public function checkPassword($request){ //Check The Password
        if (Hash::check($request->password, $this->password)){

            $token = $this->user->createToken('Mobile')->plainTextToken;

            return response()->json([
                'authenticated' => "Log in Success",
                'user' => $this->user->department,
                'token' => $token
            ], 201);
        }
        //Wrong password
        return response()->json(['authenticated' => 'Password Incorrect'], 301);
    }
    //authenticate
    public function auth(Request $request){
        $this->user = Users::where("email", $request->email)->first();
        if (!$this->user){ 
            return response()->json([
                'authenticated' => 'User Not Found'
            ], 300);
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