<?php

namespace App\Console\Commands;

use App\Models\AuditLog;
use App\Models\Users;
use App\Rules\StrongPassword;
use App\Service\SendEmail;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

/**
 * Finds the accounts that still use a password everybody can read in the public repository (the old seeder
 * password and other well-known ones), and gives each a new random password.
 *
 *   php artisan accounts:reset-weak-passwords --dry-run     only list them
 *   php artisan accounts:reset-weak-passwords               reset them and show the new passwords once
 *   php artisan accounts:reset-weak-passwords --email       reset them and email each employee the new password
 *
 * Each reset also logs the account out everywhere (its tokens are deleted).
 */
class ResetWeakPasswords extends Command
{
    protected $signature = 'accounts:reset-weak-passwords {--dry-run : only list the accounts, change nothing} {--email : email each employee the new password}';

    protected $description = 'Give a new random password to every account that still uses a well-known default password';

    /** Passwords that are published in the repository or are the first thing anybody tries. */
    public const KNOWN = ['password123', 'Password123', 'Password1', 'password', '12345678', 'Admin123', 'admin123', 'Qwerty123'];

    public function handle(): int
    {
        $weak = Users::all()->filter(function (Users $user) {
            foreach (self::KNOWN as $password) {
                if (Hash::check($password, $user->password)) {
                    return true;
                }
            }

            return false;
        });

        if ($weak->isEmpty()) {
            $this->info('No account uses a known default password.');

            return self::SUCCESS;
        }

        if ($this->option('dry-run')) {
            $this->warn($weak->count() . ' account(s) use a known default password (nothing was changed):');
            $this->table(['id', 'email', 'name', 'position', 'active'], $weak->map(fn ($u) => [$u->id, $u->email, $u->name, $u->position, $u->is_active ? 'yes' : 'no'])->all());

            return self::SUCCESS;
        }

        $rows = [];
        foreach ($weak as $user) {
            $password = StrongPassword::generate(12);
            $user->password = $password;   // the model hashes it
            $user->save();
            $user->tokens()->delete();
            AuditLog::record('admin', 'password_reset', 'success', "{$user->name}: reset because it used a known default password", $user->id, $user->email);

            $sent = $this->option('email') ? ((new SendEmail())->sendReset($user, $password) ? 'emailed' : 'email FAILED') : 'not emailed';
            $rows[] = [$user->id, $user->email, $password, $sent];
        }

        $this->info($weak->count() . ' password(s) reset. The new passwords are shown only now:');
        $this->table(['id', 'email', 'new password', 'email'], $rows);

        return self::SUCCESS;
    }
}
