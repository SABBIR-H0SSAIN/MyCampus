<?php

namespace Database\Seeders;

use App\Enums\RegistrationStatus;
use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Creates a default admin user that is pre-approved.
     */
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@mycampus.test'],
            [
                'name' => 'System Admin',
                'password' => 'password',
                'roll_number' => '0000000',
                'department' => 'CSE',
                'batch' => 2020,
                'gender' => 'male',
                'phone' => null,
                'registration_status' => RegistrationStatus::Approved,
                'student_id_card_path' => 'id-cards/admin-placeholder.jpg',
                'approved_at' => now(),
            ]
        );

        $admin->assignRole('admin');

        // Create profile for admin
        $admin->profile()->firstOrCreate();
    }
}
