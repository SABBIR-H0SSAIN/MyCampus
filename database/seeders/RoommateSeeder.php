<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\RoommatePost;
use App\Models\User;

class RoommateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all approved students and admins to create posts for
        $users = User::all();

        if ($users->isEmpty()) {
            return;
        }

        $posts = [
            [
                'title' => 'Need 1 roommate for 2BHK flat near KUET Gate',
                'location' => 'Fulbarigate, Khulna',
                'budget' => 2500,
                'move_in_date' => now()->addDays(5)->format('Y-m-d'),
                'lifestyle' => ['Non-smoker', 'Quiet', 'Student focused'],
                'looking_for' => 'Looking for a clean and quiet roommate from CSE or EEE.',
                'description' => 'A well-furnished room is available in a 2BHK flat. Walking distance from KUET main gate. Facilities include 24/7 water, Wi-Fi, and meal system.',
                'contact' => '01700000001',
                'status' => 'Open',
            ],
            [
                'title' => 'Looking for a flatmate in Sonadanga',
                'location' => 'Sonadanga, Khulna',
                'budget' => 3000,
                'move_in_date' => now()->addDays(15)->format('Y-m-d'),
                'lifestyle' => ['Social', 'Night owl', 'Pets allowed'],
                'looking_for' => 'Someone friendly and social, who doesn\'t mind a cat.',
                'description' => 'We are two students looking for a third flatmate. The flat is spacious with an attached balcony and a modern kitchen.',
                'contact' => '01700000002',
                'status' => 'Open',
            ],
            [
                'title' => 'Urgent: Roommate needed near Teligati',
                'location' => 'Teligati, Khulna',
                'budget' => 1800,
                'move_in_date' => now()->addDays(2)->format('Y-m-d'),
                'lifestyle' => ['Early bird', 'Vegetarian'],
                'looking_for' => 'Preferably someone who wakes up early and likes to study in the morning.',
                'description' => 'A single room is available in our shared apartment. Low budget and student-friendly environment. Utility bills are shared equally.',
                'contact' => '01700000003',
                'status' => 'Open',
            ],
            [
                'title' => 'Master bedroom available for 2 students',
                'location' => 'KUET Road, Khulna',
                'budget' => 4500,
                'move_in_date' => now()->addMonth()->format('Y-m-d'),
                'lifestyle' => ['Neat', 'Non-smoker'],
                'looking_for' => 'Two friends who want to share a large master bedroom with an attached bath.',
                'description' => 'The flat is fully tiled and newly painted. High-speed broadband and a maid for cooking are available. You will share the master bedroom.',
                'contact' => '01700000004',
                'status' => 'Closed',
            ],
        ];

        foreach ($posts as $index => $postData) {
            $user = $users->random();
            $postData['user_id'] = $user->id;
            RoommatePost::create($postData);
        }
    }
}
