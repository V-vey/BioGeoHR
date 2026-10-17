<?php

namespace App\Service;

use App\Models\AuditLog;
use App\Models\Users;
use Illuminate\Support\Facades\Mail;

class SendEmail
{
    public function send(Users $user, string $plainPassword): bool
    {
        $body = "Hello {$user->name},\n\n"
        . "Your BioGeo HR account has been created.\n\n"
        . "Email: {$user->email}\n"
        . "Password: {$plainPassword}\n\n"
        . "Please change your password after your first login.\n\n"
        . "To change your password follow the following step:.\n"
        . " Step 1: First login your account\n"
        . " Step 2: Go to Profile section\n"
        . " Step 3: Click Change Password\n"
        . " Step 4: Enter the given password and enter you new password\n"
        ;

        if ($link = config('app.download_url')) {
            $body .= "\n\nDownload the app: <{$link}>";
        }
        
        try {
            Mail::raw($body, fn ($m) => $m->to($user->email)->subject('Your BioGeo HR account'));
            AuditLog::record('admin', 'welcome_email', 'success', "Welcome email sent to {$user->email}");
            return true;
        } catch (\Throwable $e) {
            report($e);
            AuditLog::record('admin', 'welcome_email', 'failed', "Welcome email to {$user->email} failed");
            return false;
        }
    }
}