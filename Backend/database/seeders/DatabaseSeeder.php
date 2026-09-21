<?php
namespace Database\Seeders;

use App\Models\Users;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        Users::create([
            'name' => 'Admin HR',
            'email' => 'hr@biogeohr.test',
            'contact_number' => '09000000000',
            'password' => 'password123',
            'department' => 'HR',
            'position' => 'HR Administrator',
            'call_time' => '08:00:00',
            'contract_type' => 'Full-time',
            'date_of_birth' => '1990-01-01',
            'gender' => 'Other',
            'nationality' => 'Filipino',
            'address' => 'N/A',
        ]);
    }
}

//php artisan db:seed