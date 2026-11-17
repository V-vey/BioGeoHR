<?php
namespace Database\Seeders;

use App\Models\SystemSetting;
use App\Models\Users;
use App\Rules\StrongPassword;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // No password is written in the code (this repository is public): the one in SEED_PASSWORD (.env) is used,
        // or a random one is made and shown once
        $password = env('SEED_PASSWORD') ?: StrongPassword::generate(14);

        Users::create([
            'name' => 'Admin HR',
            'email' => 'hr@biogeohr.test',
            'contact_number' => '09000000000',
            'password' => $password, //pass capital character number lowercase
            'department' => 'Administrative',
            'position' => 'HR Administrator',
            'call_time' => '08:00:00',
            'contract_type' => 'Full-time',
            'date_of_birth' => '1990-01-01',
            'gender' => 'Other',
            'nationality' => 'Filipino',
            'address' => 'N/A',
        ]);
        SystemSetting::create();

        $this->command?->warn("HR account hr@biogeohr.test created. Its password is: {$password}   (write it down; it is not shown again)");
    }
    //php artisan tinker
    //$u = App\Models\Users::where('email', 'hr@biogeohr.test')->first(); $u->password = 'Demo2026x'; $u->save();
    //Demo2026x
}

//php artisan db:seed