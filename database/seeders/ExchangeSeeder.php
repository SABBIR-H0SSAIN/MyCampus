<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\ExchangePost;
use App\Models\ExchangeRequest;
use Carbon\Carbon;

class ExchangeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing exchange posts and requests
        ExchangeRequest::query()->delete();
        ExchangePost::query()->delete();

        // Get student user
        $user = User::where('role', 'student')->first() ?? User::where('role', 'admin')->first();

        if (!$user) {
            $this->command->warn('No user found to seed exchanges.');
            return;
        }

        $exchanges = [
            [
                'offering' => 'Rapoo E6080 Bluetooth Ultra-Slim Keyboard',
                'desire' => 'TP-Link TL-WR841N Wireless Router',
                'description' => 'Rapoo E6080 ultra-slim bluetooth keyboard. Want to exchange with a good router.',
                'phone' => '+880 1711 000014',
                'images' => [
                    '/storage/marketplace/rapoo_keyboard.jpg',
                    '/storage/marketplace/tplink_router.jpg'
                ],
            ],
            [
                'offering' => 'Click Stand Fan & Wardrobe',
                'desire' => 'Click Ceiling Fan',
                'description' => 'Looking to trade my stand fan and wardrobe setup for a ceiling fan.',
                'phone' => '+880 1711 000014',
                'images' => [
                    '/storage/marketplace/click_fan.jpg',
                    '/storage/marketplace/click_ceiling_fan.png'
                ],
            ],
            [
                'offering' => 'Wooden Study Table with Bookshelf',
                'desire' => 'Semi-Double Bed & Mattress Set',
                'description' => 'Study table in great condition. Need a semi-double bed frame and mattress.',
                'phone' => '+880 1711 000014',
                'images' => [
                    '/storage/marketplace/bookshelf_study_table.jpg',
                    '/storage/marketplace/semi_double_bed.jpg'
                ],
            ],
            [
                'offering' => 'Red 4-Tier Plastic Storage Rack',
                'desire' => 'Metal Trunk Chest',
                'description' => 'Need to store heavier things. Looking to swap my storage rack for a metal trunk chest.',
                'phone' => '+880 1711 000014',
                'images' => [
                    '/storage/marketplace/red_rack.jpg',
                    '/storage/marketplace/trunk.png'
                ],
            ],
            [
                'offering' => 'Plastic Chair',
                'desire' => 'Wooden Study Table with Bookshelf',
                'description' => 'Trade my plastic chair with a study table. Negotiable.',
                'phone' => '+880 1711 000014',
                'images' => [
                    '/storage/marketplace/plastic_chair.png',
                    '/storage/marketplace/bookshelf_study_table.jpg'
                ],
            ],
            [
                'offering' => 'Pak Wall Bracket Fan',
                'desire' => 'RFL Gas Stove with LP Gas Cylinder',
                'description' => 'Wall moving fan. Need a gas stove set with a cylinder for my hostel room.',
                'phone' => '+880 1711 000014',
                'images' => [
                    '/storage/marketplace/pak_wall_fan.jpg',
                    '/storage/marketplace/gas_stove.jpg'
                ],
            ]
        ];

        foreach ($exchanges as $index => $exchange) {
            ExchangePost::create(array_merge($exchange, [
                'user_id' => $user->id,
                'status' => 'Open',
                'created_at' => Carbon::now()->subDays($index),
            ]));
        }

        $this->command->info('Exchange database seeded successfully with 6 posts.');
    }
}
