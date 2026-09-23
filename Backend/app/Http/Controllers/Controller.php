<?php

namespace App\Http\Controllers;
use Laravel\Sanctum\PersonalAccessToken;
use Carbon\Carbon;
use App\Models\AuditLog;

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

    protected function dateComp($startDate, $endDate){
        $start = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);

        $result = $start->diffInDays($end) + 1;
        return $result;
    }

    protected function logAudit($action, $description = null)
    {
        AuditLog::create([
            'user_id' => $this->getUserIdFromToken(),
            'action' => $action,
            'description' => $description,
            'ip_address' => request()->ip(),
        ]);
    }
}
