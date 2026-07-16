<?php

namespace Database\Seeders;

use App\Enums\RegistrationStatus;
use App\Models\LostAndFoundItem;
use App\Models\User;
use Illuminate\Database\Seeder;

class LostAndFoundSeeder extends Seeder
{
    /**
     * Seed the lost_and_found_items table with exactly 3 entries:
     *   - 2 'lost' posts
     *   - 1 'found' post
     *
     * Each entry references an existing image from public/storage/marketplace/,
     * so the demo UI shows real, thematically-appropriate thumbnails without
     * needing extra image files.
     */
    public function run(): void
    {
        // Clear any prior entries so we stay at exactly 3 demo rows on every run.
        LostAndFoundItem::query()->delete();

        $mainStudent = User::where('email', 'sabbir01619@gmail.com')->first();
        $testStudent = User::where('email', 'test.roommate@mycampus.test')->first();

        // Pool excludes the main student so post #1 (deterministically his)
        // does not get reassigned to him by random pick below.
        $pool = User::where('registration_status', RegistrationStatus::Approved)
            ->when($mainStudent, fn ($q) => $q->where('id', '!=', $mainStudent->id))
            ->get();

        if (!$mainStudent || $pool->isEmpty()) {
            // Hard requirement: we need both an author and a fallback pool.
            // If neither seeded student exists yet, abort without crashing.
            if (!$mainStudent) {
                return;
            }
            $pool = collect([$mainStudent]);
        }

        // 3 entries — 2 lost + 1 found. Images already exist on disk in
        // public/storage/marketplace/. Frontend stores/expects these paths
        // verbatim (with the leading "/storage/" prefix).
        $items = [
            // LOST #1 — main student's report (so "My Reports" tab is populated)
            [
                'type'        => 'lost',
                'title'       => 'Lost black wallet near Central Library',
                'category'    => 'Wallet',
                'description' => 'Black bifold wallet with two ID cards and some cash inside. Last seen on the 2nd floor reading room table of Central Library. Please reach out if found — reward offered.',
                'location'    => 'Central Library, 2nd floor',
                'date'        => now()->subDays(2)->format('Y-m-d'),
                'phone'       => '01729841427',
                'status'      => 'active',
                'images'      => ['/storage/marketplace/tplink_router.jpg'],
            ],
            // LOST #2 — posted by the test roommate author
            [
                'type'        => 'lost',
                'title'       => 'Lost wireless earphones around the library',
                'category'    => 'Accessories',
                'description' => 'Black wireless earbuds with a small charging case. Possibly dropped somewhere between the CSE Building and Central Library. Please contact if you find them.',
                'location'    => 'CSE Building to Library walkway',
                'date'        => now()->subDay()->format('Y-m-d'),
                'phone'       => '01700000200',
                'status'      => 'active',
                'images'      => ['/storage/marketplace/red_rack.jpg'],
            ],
            // FOUND #1 — random pool user
            [
                'type'        => 'found',
                'title'       => 'Found: scientific calculator in CSE Building',
                'category'    => 'Calculator',
                'description' => 'A scientific calculator (Casio-style) in a black pouch was found near the CSE Building staircase. Contact to identify and reclaim.',
                'location'    => 'CSE Building, ground floor staircase',
                'date'        => now()->subDays(3)->format('Y-m-d'),
                'phone'       => '01611002233',
                'status'      => 'active',
                'images'      => ['/storage/marketplace/rapoo_keyboard.jpg'],
            ],
        ];

        foreach ($items as $index => $itemData) {
            if ($index === 0 && $mainStudent) {
                $author = $mainStudent;
            } elseif ($index === 1 && $testStudent) {
                $author = $testStudent;
            } else {
                // Fallback random pick — but never reassign to the main student.
                $author = ($mainStudent && $pool->contains('id', $mainStudent->id))
                    ? $pool->firstWhere('id', '!=', $mainStudent->id) ?? $mainStudent
                    : $pool->random();
            }

            LostAndFoundItem::create(array_merge($itemData, [
                'user_id' => $author->id,
            ]));
        }
    }
}
