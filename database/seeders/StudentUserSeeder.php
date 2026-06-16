<?php

namespace Database\Seeders;

use App\Enums\RegistrationStatus;
use App\Models\User;
use Illuminate\Database\Seeder;

class StudentUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first();

        $student = User::firstOrCreate(
            ['email' => 'sabbir01619@gmail.com'],
            [
                'name' => 'Sabbir Hossain',
                'password' => 'password',
                'roll_number' => '2207102',
                'department' => 'CSE',
                'batch' => 2022,
                'gender' => 'male',
                'blood_group' => 'O+',
                'phone' => '01729841427',
                'role' => 'student',
                'registration_status' => RegistrationStatus::Approved,
                'student_id_card_path' => 'id-cards/student-placeholder.jpg',
                'approved_at' => now(),
                'approved_by' => $admin ? $admin->id : null,
            ]
        );

        // Create profile for student
        $student->profile()->firstOrCreate();
    }
}
