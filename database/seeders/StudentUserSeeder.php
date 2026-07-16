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

        // Second approved student so the main user (Sabbir) can test
        // the AI Roommate compatibility feature against someone else's post.
        $roommateAuthor = User::firstOrCreate(
            ['email' => 'test.roommate@mycampus.test'],
            [
                'name' => 'Test Roommate Author',
                'password' => 'password',
                'roll_number' => '2207200',
                'department' => 'EEE',
                'batch' => 2022,
                'gender' => 'male',
                'blood_group' => 'B+',
                'phone' => '01700000200',
                'role' => 'student',
                'registration_status' => RegistrationStatus::Approved,
                'student_id_card_path' => 'id-cards/test-roommate-placeholder.jpg',
                'approved_at' => now(),
                'approved_by' => $admin ? $admin->id : null,
            ]
        );

        // Create profile (with bio so AI matching has richer data)
        $roommateAuthor->profile()->firstOrCreate([]);
        $roommateAuthor->profile()->update([
            'bio' => 'Quiet CSE/EEE student. Studies mostly at night and keeps a clean room. Looking for a calm roommate.',
        ]);
    }
}
