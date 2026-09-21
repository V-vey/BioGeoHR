<?php

namespace App\Http\Controllers;
use Laravel\Sanctum\PersonalAccessToken;     
use Carbon\Carbon;                 
abstract class Controller
{
    protected function getUserIdFromToken(): ?int
    {
        $rawTokenString = request()->bearerToken();    
        
        if (!$rawTokenString) {
            return null;
        }

        $token = PersonalAccessToken::findToken($rawTokenString);
        return $token?->tokenable_id;
    }
    function dateComp($startDate, $endDate){
        $start = Carbon::parse($request->start_date);
        $end = Carbon::parse($request->end_date);

        $result = $startDate->diffInDays($endDate);
        return $result;
    }
}
