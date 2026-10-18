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

    /** The email an employee gets when HR resets their password. */
    public function sendReset(Users $user, string $plainPassword): bool
    {
        $body = "Hello {$user->name},\n\n"
        . "HR has reset your BioGeo HR password.\n\n"
        . "Email: {$user->email}\n"
        . "New password: {$plainPassword}\n\n"
        . "Your old password no longer works. Please change this password after you log in:\n"
        . " Step 1: Log in with the password above\n"
        . " Step 2: Go to Profile section\n"
        . " Step 3: Click Change Password\n"
        . " Step 4: Enter the password above, then your new password\n"
        ;

        try {
            Mail::raw($body, fn ($m) => $m->to($user->email)->subject('Your BioGeo HR password was reset'));
            AuditLog::record('admin', 'password_reset_email', 'success', "Password reset email sent to {$user->email}");
            return true;
        } catch (\Throwable $e) {
            report($e);
            AuditLog::record('admin', 'password_reset_email', 'failed', "Password reset email to {$user->email} failed");
            return false;
        }
    }
}