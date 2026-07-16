<?php

namespace Database\Seeders;

use App\Models\MarketplaceListing;
use App\Models\User;
use Illuminate\Database\Seeder;

class MarketplaceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Ordering note: MarketplaceListingController::index uses ->latest(),
     * so the LAST item in the $listings array will appear at the TOP of the UI
     * and the FIRST item will appear at the BOTTOM.
     *
     * Current layout:
     *   - TOP ROW (newest):    [12] Red Rack, [11] Semi-Double Bed, [10] Wooden Study Table
     *   - MIDDLE:               [9] RFL Gas Stove … [2] Hostel Furniture Set
     *   - BOTTOM (oldest):      [1] Rapoo E6080 Keyboard
     */
    public function run(): void
    {
        // Get the student user (e.g. Sabbir Hossain) to act as the seller for these mock items
        // If not found, use admin as fallback.
        $user = User::where('role', 'student')->first() ?? User::where('role', 'admin')->first();

        if (!$user) {
            return;
        }

        // Clear existing marketplace listings to avoid duplication
        MarketplaceListing::query()->delete();

        $listings = [
            // [1] BOTTOM of UI — Rapoo Keyboard explicitly requested at the very bottom
            [
                'title' => 'Rapoo E6080 Bluetooth Ultra-Slim Keyboard',
                'price' => 1300,
                'condition' => 'New',
                'category' => 'Electronics',
                'location' => 'Lalon Shah Hall',
                'description' => "Wireless keyboard will be sold (New condition).\nThe dongle is missing.\nBluetooth connection only.\nRapoo E6080 Bluetooth Ultra-Slim Keyboard.\nSTAR tech price: 1780 taka",
                'phone' => '+880 1711 000014',
                'image_path' => '/storage/marketplace/rapoo_keyboard.jpg',
            ],
            // [2] Hostel Furniture Set
            [
                'title' => 'Hostel Furniture Set (Bed, Table & Chair)',
                'price' => 4500,
                'condition' => 'Good',
                'category' => 'Furniture',
                'location' => 'Off-campus Mess',
                'description' => "1টি বেড 6'2'' - 3' (sold)\n1টি টেবিল আলমোস্ট 3'-2' 1inch kom beshi hote pare (sold)\n1টি চেয়ার সেল দেয়া হবে। (Sold)\n\nAll products are in almost fresh condition\nIf anyone is interested, please reach out to me.",
                'phone' => '+880 1711 000014',
                'images' => [
                    '/storage/marketplace/wooden_bed.png',
                    '/storage/marketplace/wooden_table.png'
                ],
            ],
            // [3] Click Stand Fan & Wardrobe
            [
                'title' => 'Click Stand Fan & Wardrobe',
                'price' => 6500,
                'condition' => 'Used',
                'category' => 'Electronics',
                'location' => 'Lalon Shah Hall',
                'description' => "Table Fan and wardrobe for sell.\nAsking price for the fan : 3k (1 year used) [sold]\nAsking price for the wardrobe: 3.5k (3 years used)\nNegotiable.\nUpdate: Fan sold",
                'phone' => '+880 1711 000014',
                'image_path' => '/storage/marketplace/click_fan.jpg',
            ],
            // [4] TP-Link Router
            [
                'title' => 'TP-Link TL-WR841N 300Mbps Wireless Router',
                'price' => 850,
                'condition' => 'Good',
                'category' => 'Electronics',
                'location' => 'Lalon Shah Hall',
                'description' => "TP-Link TL-WR841N 300Mbps Wireless N Router\n✅ Good working condition\n✅ 300 Mbps Wi-Fi speed\n✅ Stable connection with dual antennas\n✅ All ports and Wi-Fi working perfectly\n✅ Power adapter included\nReason for selling: No longer needed.",
                'phone' => '+880 1711 000014',
                'image_path' => '/storage/marketplace/tplink_router.jpg',
            ],
            // [5] Click Ceiling Fan
            [
                'title' => 'Click Ceiling Fan',
                'price' => 2000,
                'condition' => 'Used',
                'category' => 'Electronics',
                'location' => 'Lalon Shah Hall',
                'description' => "Click ceiling fan for sell\n\nBuying price 2800 tk\nSelling price 2000 tk.\nNegotiable\nNo warrenty.",
                'phone' => '+880 1711 000014',
                'image_path' => '/storage/marketplace/click_ceiling_fan.png',
            ],
            // [6] Pak Wall Bracket Fan
            [
                'title' => 'Pak Wall Bracket Fan',
                'price' => 1800,
                'condition' => 'Used',
                'category' => 'Electronics',
                'location' => 'Lalon Shah Hall',
                'description' => "Pak Wall Moving Fan for sale",
                'phone' => '+880 1711 000014',
                'image_path' => '/storage/marketplace/pak_wall_fan.jpg',
            ],
            // [7] Plastic Chair
            [
                'title' => 'Plastic Chair',
                'price' => 300,
                'condition' => 'Used',
                'category' => 'Furniture',
                'location' => 'Shahid Smriti Hall',
                'description' => "চেয়ার বিক্রি হবে। (Table sold)\nলোকেশন: শহীদ স্মৃতি হল, ৪০১২ পূর্ব।",
                'phone' => '+880 1711 000014',
                'image_path' => '/storage/marketplace/plastic_chair.png',
            ],
            // [8] Metal Trunk Chest
            [
                'title' => 'Metal Trunk Chest',
                'price' => 500,
                'condition' => 'Used',
                'category' => 'Furniture',
                'location' => 'Khan Jahan Ali Hall',
                'description' => "Update: Sold Out\n\nTrunk for sell\nPrice :500tk\nLocation : Khan Jahan Ali Hall,Room:314",
                'phone' => '+880 1711 000014',
                'image_path' => '/storage/marketplace/trunk.png',
            ],
            // [9] RFL Gas Stove
            [
                'title' => 'RFL Gas Stove with LP Gas Cylinder',
                'price' => 2500,
                'condition' => 'Good',
                'category' => 'Electronics',
                'location' => 'Al Aqsa Mosque, KUET',
                'description' => "RFL gas stove with cylinder for sell...\nAround 1 year used... Is in good condition...\nLocation- Al Aqsa Mosque, KUET",
                'phone' => '+880 1711 000014',
                'image_path' => '/storage/marketplace/gas_stove.jpg',
            ],
            // ─── TOP ROW of UI (newest items appear first) ───
            // [10] TOP ROW — 3rd slot: Wooden Study Table with Bookshelf
            [
                'title' => 'Wooden Study Table with Bookshelf',
                'price' => 3500,
                'condition' => 'Excellent',
                'category' => 'Furniture',
                'location' => 'Lalon Shah Hall',
                'description' => "A study table is available for sale. The table is in excellent condition, with no major defects. If you are interested please feel free to send me a message in my inbox. Price negotiable.",
                'phone' => '+880 1711 000014',
                'image_path' => '/storage/marketplace/bookshelf_study_table.jpg',
            ],
            // [11] TOP ROW — 2nd slot: Semi-Double Bed & Mattress Set
            [
                'title' => 'Semi-Double Bed & Mattress Set',
                'price' => 1500,
                'condition' => 'Used',
                'category' => 'Furniture',
                'location' => 'Lalon Shah Hall',
                'description' => "For sale\nএকটা সেমি ডাবল খাট(800)(sold)\nদুইটা তোষক (400)(sold)\nবিচানা চাদর +বালিশ + কভার(300)\nSlightly Negotiable",
                'phone' => '+880 1711 000014',
                'image_path' => '/storage/marketplace/semi_double_bed.jpg',
            ],
            // [12] TOP ROW — 1st slot (very first card user sees): Red 4-Tier Plastic Storage Rack
            [
                'title' => 'Red 4-Tier Plastic Storage Rack',
                'price' => 400,
                'condition' => 'Good',
                'category' => 'Furniture',
                'location' => 'Lalon Shah Hall',
                'description' => "Gonna sell this rack.\n\nYou can store literally everything like this except your cg.",
                'phone' => '+880 1711 000014',
                'image_path' => '/storage/marketplace/red_rack.jpg',
            ],
        ];

        foreach ($listings as $i => $listing) {
            if (isset($listing['image_path'])) {
                $listing['images'] = [$listing['image_path']];
                unset($listing['image_path']);
            }
            $listing = array_merge($listing, ['user_id' => $user->id]);

            // Space out created_at by 1s per item so ->latest() ordering is
            // deterministic. Item at index N gets the (N+1)th-oldest timestamp,
            // making the LAST item in the array (the top-of-UI items) the newest.
            $timestamp = now()->subSeconds(count($listings) - $i);
            MarketplaceListing::create($listing);
            // Force-update the timestamp AFTER create (created_at isn't fillable).
            MarketplaceListing::where('title', $listing['title'])
                ->orderByDesc('id')
                ->limit(1)
                ->update(['created_at' => $timestamp, 'updated_at' => $timestamp]);
        }
    }
}