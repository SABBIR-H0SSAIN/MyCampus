<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\BloodRequest;
use App\Models\User;

class BloodRequestSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();
        if ($users->isEmpty()) {
            return;
        }

        $requests = [
            [
                'blood_group' => 'A+',
                'units' => 2,
                'hospital' => 'Dhaka Medical College Hospital',
                'date_time' => now()->addDays(2),
                'contact' => '01711223344',
                'priority' => 'Emergency',
                'notes' => 'Urgent requirement for a bypass surgery.',
                'status' => 'Active',
            ],
            [
                'blood_group' => 'O-',
                'units' => 1,
                'hospital' => 'Square Hospital',
                'date_time' => now()->addDays(5),
                'contact' => '01899887766',
                'priority' => 'Standard',
                'notes' => 'Required for a thalassemia patient.',
                'status' => 'Active',
            ],
            [
                'blood_group' => 'B+',
                'units' => 3,
                'hospital' => 'Evercare Hospital',
                'date_time' => now()->subDays(1),
                'contact' => '01922334455',
                'priority' => 'Emergency',
                'notes' => 'Accident case.',
                'status' => 'Resolved',
            ],
            [
                'blood_group' => 'AB+',
                'units' => 1,
                'hospital' => 'Rajshahi Medical College',
                'date_time' => now()->addDays(10),
                'contact' => '01611223344',
                'priority' => 'Standard',
                'notes' => 'Scheduled surgery.',
                'status' => 'Active',
            ]
        ];

        foreach ($requests as $requestData) {
            $requestData['user_id'] = $users->random()->id;
            BloodRequest::create($requestData);
        }
    }
}
