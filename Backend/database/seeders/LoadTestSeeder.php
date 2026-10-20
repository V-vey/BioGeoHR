<?php

namespace Database\Seeders;

use App\Models\LeaveBalance;
use App\Models\Location;
use App\Models\Salary;
use App\Models\SystemSetting;
use App\Models\Users;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

/**
 * The accounts for the JMeter load test (non-functional test 4): 150 employees, one geofence, and a
 * CSV with one login token per employee for JMeter to read.
 *
 *   DB_DATABASE=biogeohr_load php artisan db:seed --class=LoadTestSeeder
 *
 * It refuses to run on any other database, so the real data is never touched.
 */
class LoadTestSeeder extends Seeder
{
    public const DATABASE = 'biogeohr_load';
    public const FENCE = 'Load Test Fence';
    public const USERS = 150;

    public function run(): void
    {
        $db = DB::connection()->getDatabaseName();
        if ($db !== self::DATABASE) {
            $this->command->error("Refusing to seed '{$db}'. Run it with DB_DATABASE=" . self::DATABASE . '.');
            return;
        }

        // the fence from the paper's geo-fence test: 15.4709 N, 120.6035 E, 50 m
        Location::firstOrCreate(['name' => self::FENCE], ['latitude' => 15.4709, 'longitude' => 120.6035, 'radius' => 50]);
        SystemSetting::firstOrCreate([], ['late_grace_period_minutes' => 15, 'geofence_check_interval_minutes' => 15]);

        $tokens = [];
        for ($i = 1; $i <= self::USERS; $i++) {
            $email = sprintf('loadtest%03d@loadtest.test', $i);
            $user = Users::where('email', $email)->first() ?? Users::create([
                'name' => sprintf('Load Test %03d', $i), 'email' => $email, 'contact_number' => '0917',
                'password' => 'LoadTest#12345', 'department' => 'Basic Education', 'position' => 'Teacher',
                'call_time' => '07:30:00', 'contract_type' => 'Regular', 'date_of_birth' => '1990-01-01',
                'gender' => 'Male', 'nationality' => 'Filipino', 'address' => 'Tarlac',
                'employment_status' => 'Permanent', 'is_active' => true,
            ]);

            Salary::firstOrCreate(['user_id' => $user->id], ['salary_basis' => 20000, 'working_hours_per_day' => 8, 'working_days_per_month' => 26]);
            LeaveBalance::firstOrCreate(['user_id' => $user->id], LeaveBalance::FULL_CREDITS);

            $user->tokens()->delete();
            $tokens[] = $user->createToken('loadtest')->plainTextToken;
        }

        $dir = storage_path('app/loadtest');
        File::ensureDirectoryExists($dir);
        File::put($dir . '/tokens.csv', implode("\n", $tokens) . "\n");

        $this->command->info(self::USERS . " load-test employees ready. Tokens: {$dir}/tokens.csv");
    }
}
