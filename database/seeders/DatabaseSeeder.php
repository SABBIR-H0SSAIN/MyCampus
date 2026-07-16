<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */ 
    public function run(): void
    {
        $this->call([
            AdminUserSeeder::class,
            StudentUserSeeder::class,
            MarketplaceSeeder::class,
            ExchangeSeeder::class,
            ResourceSeeder::class,
            BloodRequestSeeder::class,
            RoommateSeeder::class,
            AnnouncementSeeder::class,
            LostAndFoundSeeder::class,
        ]);
    }
}
