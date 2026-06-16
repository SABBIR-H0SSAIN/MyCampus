<?php

namespace Database\Seeders;

use App\Models\MarketplaceListing;
use App\Models\User;
use Illuminate\Database\Seeder;

class MarketplaceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the admin user to act as the seller for these mock items
        // In a real scenario, we'd have multiple users. We will just use the admin for now.
        $user = User::where('role', 'admin')->first();

        if (!$user) {
            return;
        }

        $listings = [
            [
                'title' => 'Casio FX-991EX (Pristine)',
                'price' => 1450,
                'condition' => 'Like new',
                'category' => 'Academic',
                'location' => 'Hall-3',
                'description' => 'Pristine Casio FX-991EX scientific calculator. Bought last semester, used for exams only. No scratches, all functions work perfectly. Box and manual included.',
                'phone' => '+880 1700 000042',
                'image_path' => 'https://images.unsplash.com/photo-1574607383476-f517f260d30b?w=600&q=70',
                'is_sold' => false,
            ],
            [
                'title' => 'Keychron K2 v2 Mechanical',
                'price' => 6500,
                'condition' => 'Used 6 months',
                'category' => 'Electronics',
                'location' => 'Hall-4',
                'description' => 'Keychron K2 v2 with brown switches. Used 6 months for coding assignments. Comes with original USB-C cable. Minor keycap shine on home row.',
                'phone' => '+880 1711 000014',
                'image_path' => 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=70',
                'is_sold' => false,
            ],
            [
                'title' => 'Cycle — Foxter MTB',
                'price' => 9200,
                'condition' => 'Good',
                'category' => 'Transport',
                'location' => 'Off-campus',
                'description' => 'Foxter MTB 26-inch. Serviced last month — new brake pads, fresh chain lube. No rust. Perfect for KUET gate to city-centre commute.',
                'phone' => '+880 1712 000021',
                'image_path' => 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=600&q=70',
                'is_sold' => false,
            ],
            [
                'title' => 'Fluid Mechanics — Frank M. White',
                'price' => 480,
                'condition' => 'Fair',
                'category' => 'Books',
                'location' => 'Hall-1',
                'description' => 'Frank White 8th edition. Highlighted chapters 1–6 only. Clean otherwise. Great for ME 2203. Selling because graduated.',
                'phone' => '+880 1713 000055',
                'image_path' => 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=70',
                'is_sold' => false,
            ],
            [
                'title' => 'Logitech MX Master 3S',
                'price' => 7800,
                'condition' => 'Like new',
                'category' => 'Electronics',
                'location' => 'Hall-5',
                'description' => 'MX Master 3S, wireless. Bought new 4 months ago. Slightly used, no marks. 7-button programmable. Perfect for design/dev work.',
                'phone' => '+880 1715 000033',
                'image_path' => 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=70',
                'is_sold' => false,
            ],
            [
                'title' => 'Drafting Table (Foldable)',
                'price' => 2200,
                'condition' => 'Good',
                'category' => 'Furniture',
                'location' => 'Off-campus',
                'description' => 'Foldable drafting table, wooden surface. Small chip on corner. Selling because switched to digital. Off-campus pickup only.',
                'phone' => '+880 1717 000022',
                'image_path' => 'https://images.unsplash.com/photo-1503602642458-232111445657?w=600&q=70',
                'is_sold' => true,
            ],
            [
                'title' => 'Wacom Intuos Small',
                'price' => 4500,
                'condition' => 'Excellent',
                'category' => 'Electronics',
                'location' => 'Hall-2',
                'description' => 'Wacom Intuos Small (CTL-4100). Comes with 3 spare nibs and original cable. No dead zones.',
                'phone' => '+880 1719 000031',
                'image_path' => 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&q=70',
                'is_sold' => false,
            ],
            [
                'title' => 'Casio Scientific FX-100MS',
                'price' => 650,
                'condition' => 'Good',
                'category' => 'Academic',
                'location' => 'Hall-7',
                'description' => 'Casio FX-100MS in good condition. Minor scratches on back cover. All scientific functions verified.',
                'phone' => '+880 1718 000015',
                'image_path' => 'https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=600&q=70',
                'is_sold' => false,
            ],
            [
                'title' => 'JBL Charge 5 Speaker',
                'price' => 5800,
                'condition' => 'Excellent',
                'category' => 'Electronics',
                'location' => 'Hall-3',
                'description' => 'JBL Charge 5 portable Bluetooth speaker. 20-hour battery. IP67 waterproof. Used indoors only. Includes original cable and box.',
                'phone' => '+880 1700 000042',
                'image_path' => 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=70',
                'is_sold' => false,
            ],
            [
                'title' => 'Engineering Drawing Set',
                'price' => 350,
                'condition' => 'Good',
                'category' => 'Academic',
                'location' => 'Hall-3',
                'description' => 'Full engineering drawing set: compass, dividers, set squares, French curves, scales. Used for 2 semesters. All pieces present.',
                'phone' => '+880 1700 000042',
                'image_path' => 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&q=70',
                'is_sold' => false,
            ],
            [
                'title' => 'Casio FX-991EX (Silver)',
                'price' => 1350,
                'condition' => 'Like new',
                'category' => 'Academic',
                'location' => 'Hall-2',
                'description' => 'Silver edition FX-991EX. Used twice for lab practicals. Still has protective film on screen. Works like new.',
                'phone' => '+880 1712 000021',
                'image_path' => 'https://images.unsplash.com/photo-1574607383476-f517f260d30b?w=600&q=70',
                'is_sold' => false,
            ],
            [
                'title' => 'USB-C Hub — 7-in-1',
                'price' => 1800,
                'condition' => 'Like new',
                'category' => 'Electronics',
                'location' => 'Hall-7',
                'description' => '7-in-1 USB-C hub: 3×USB-A, SD, microSD, HDMI 4K, 100W PD. Upgrading to Thunderbolt dock, hence selling.',
                'phone' => '+880 1718 000015',
                'image_path' => 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=600&q=70',
                'is_sold' => false,
            ]
        ];

        foreach ($listings as $listing) {
            MarketplaceListing::create(array_merge($listing, ['user_id' => $user->id]));
        }
    }
}
