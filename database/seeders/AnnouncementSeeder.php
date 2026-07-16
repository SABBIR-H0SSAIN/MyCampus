<?php

namespace Database\Seeders;

use App\Models\Announcement;
use App\Models\User;
use Illuminate\Database\Seeder;

class AnnouncementSeeder extends Seeder
{
    /**
     * Seed the announcements table with a realistic variety of entries
     * covering all four categories (Academic, Event, Club, Emergency).
     *
     * Posted by the admin user so the frontend always has a known author.
     */
    public function run(): void
    {
        // Prefer the seeded admin so the announcements page has a consistent
        // author. Fall back to any admin if the email-based lookup fails.
        $author = User::where('email', 'admin@mycampus.test')->first()
            ?? User::where('role', 'admin')->first();

        if (!$author) {
            // No admin yet — abort gracefully rather than crashing the whole
            // migrate:fresh --seed run.
            return;
        }

        $announcements = [
            [
                'category'     => 'Emergency',
                'is_pinned'    => true,
                'published_at' => now()->subHour(),
                'title'        => 'Campus-wide fire drill scheduled for Friday',
                'body'         => 'All students and staff are advised that a fire evacuation drill will take place this Friday at 11:30 AM across all academic buildings and halls. Please cooperate with floor marshals and follow the designated assembly points at the central field. Classes held in those buildings between 11:00 and 12:30 are suspended.',
            ],
            [
                'category'     => 'Event',
                'is_pinned'    => true,
                'published_at' => now()->subHours(2),
                'title'        => 'KUET Intra-University Programming Contest 2026',
                'body'         => 'Registration is now open for the annual Intra-University Programming Contest. The preliminary round will be held on August 15 in the CSE Building labs, with the top 20 teams advancing to the on-site finals on August 22 in the Student Union auditorium. Teams of 2–3, register via the Resources Hub. Cash prizes for the top three teams.',
            ],
            [
                'category'     => 'Academic',
                'is_pinned'    => false,
                'published_at' => now()->subHours(6),
                'title'        => 'Mid-term examination schedule published',
                'body'         => 'The mid-term examination schedule for the 2026 fall semester has been published. Please collect your admit card from your respective department offices at least two days before your first exam. No student will be allowed into the exam hall without a valid admit card and campus ID.',
            ],
            [
                'category'     => 'Academic',
                'is_pinned'    => false,
                'published_at' => now()->subDay(),
                'title'        => 'Class suspension on Wednesday due to faculty development program',
                'body'         => 'All undergraduate classes will remain suspended on Wednesday, July 23, due to the university-wide faculty development workshop. Laboratory sessions scheduled for that day will be rescheduled by the respective departments. Hostel dining and library services will operate as usual.',
            ],
            [
                'category'     => 'Event',
                'is_pinned'    => false,
                'published_at' => now()->subDays(2),
                'title'        => 'Inter-department football tournament kicks off next Monday',
                'body'         => 'The annual inter-department football tournament begins next Monday at 4:00 PM at the central playground. Captains are requested to submit their 14-member squad lists to the Sports Office by Saturday evening. The trophy and individual awards will be presented at the closing ceremony on August 5.',
            ],
            [
                'category'     => 'Event',
                'is_pinned'    => false,
                'published_at' => now()->subDays(3),
                'title'        => 'TechFest 2026 — call for project demos',
                'body'         => 'TechFest 2026, our flagship showcase of student-built tech projects, will be held on September 6 in the ECE building atrium. We are inviting project demos in AI/ML, IoT, robotics, and web/software. Submit your abstracts (500 words max) by August 20. Selected teams receive mentorship and presentation slots.',
            ],
            [
                'category'     => 'Club',
                'is_pinned'    => false,
                'published_at' => now()->subDays(4),
                'title'        => 'KUET Photography Club weekly meetup',
                'body'         => 'The Photography Club meets every Thursday at 6:00 PM in Room 204 of the Architecture building. This week we will review submissions for the "Campus Life" themed photo contest. New members are welcome — bring any camera or even just your phone.',
            ],
            [
                'category'     => 'Emergency',
                'is_pinned'    => false,
                'published_at' => now()->subDays(5),
                'title'        => 'Power outage notice for BCL and Teacher-Student Centre',
                'body'         => 'Due to scheduled maintenance of the campus sub-station, BCL and the Teacher-Student Centre will experience a complete power outage from 10:00 PM on Saturday to 6:00 AM on Sunday. Please save your work and unplug sensitive equipment in advance. Wi-Fi in those buildings will also be unavailable during this window.',
            ],
            [
                'category'     => 'Club',
                'is_pinned'    => false,
                'published_at' => now()->subWeek(),
                'title'        => 'Robotics Club orientation for new members',
                'body'         => 'The Robotics Club orientation session for new members is scheduled for this Saturday at 3:00 PM in the EEE Building workshop. You will get a hands-on introduction to microcontrollers, motor drivers, and basic line-follower robots. No prior experience required — bring your laptop and an open mind.',
            ],
        ];

        foreach ($announcements as $data) {
            Announcement::create(array_merge($data, ['created_by' => $author->id]));
        }
    }
}
