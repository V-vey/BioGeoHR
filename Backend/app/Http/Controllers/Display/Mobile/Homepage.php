<?php
namespace App\Http\Controllers\Display\Mobile;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

//Models
use App\Models\LeaveApplication;
use App\Models\Attendance;
use App\Models\Salary;


class Homepage extends Controller
{
    private function displayNeeds(){
        //The User Token
        $rawTokenString = $request->bearerToken();    
        
        //Access Token
        $token = PersonalAccessToken::findToken($rawTokenString);
        $userId = $token?->tokenable_id;

        //paycheck
        //late
        
        //Recent Attendance
        //Recent Leave


    }
}