<?php

namespace App\Http\Controllers;
use Laravel\Sanctum\PersonalAccessToken; 
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
}
