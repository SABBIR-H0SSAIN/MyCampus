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
        // Get some users
        $users = User::where('registration_status', 'Approved')->take(3)->get();

        if ($users->count() < 2) {
            $this->command->warn('Not enough approved users to seed exchanges. Need at least 2.');
            return;
        }

        $user1 = $users[0];
        $user2 = $users[1];
        $user3 = $users->count() > 2 ? $users[2] : $user1;

        // Post 1
        $post1 = ExchangePost::create([
            'user_id' => $user1->id,
            'offering' => 'Calculus by Stewart (8e)',
            'desire' => 'Engineering Mathematics by Stroud',
            'description' => 'I have the Stewart book in very good condition. Need the Stroud one for my next semester.',
            'phone' => '+880 1711 000001',
            'images' => ['https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&q=70'],
            'status' => 'Open',
            'created_at' => Carbon::now()->subDays(2),
        ]);

        // Request on Post 1
        ExchangeRequest::create([
            'exchange_post_id' => $post1->id,
            'user_id' => $user2->id,
            'message' => 'Hi, I have the Stroud book in excellent condition. Let me know if we can meet at the library.',
            'phone' => '+880 1718 000015',
            'status' => 'pending',
            'created_at' => Carbon::now()->subHours(2),
        ]);

        ExchangeRequest::create([
            'exchange_post_id' => $post1->id,
            'user_id' => $user3->id,
            'message' => 'I have an older edition if you are okay with that.',
            'phone' => '+880 1717 000022',
            'status' => 'declined',
            'created_at' => Carbon::now()->subDay(),
        ]);

        // Post 2
        ExchangePost::create([
            'user_id' => $user2->id,
            'offering' => 'Casio FX-991EX',
            'desire' => 'Casio FX-100MS + cash',
            'description' => 'Upgrading to a programmable one, so I need to downgrade and get some cash.',
            'phone' => '+880 1722 000002',
            'images' => ['https://images.unsplash.com/photo-1574607383476-f517f260d30b?w=500&q=70'],
            'status' => 'Open',
            'created_at' => Carbon::now()->subDays(1),
        ]);

        // Post 3
        ExchangePost::create([
            'user_id' => $user3->id,
            'offering' => 'Mechanical drawing T-square',
            'desire' => 'Set of French curves',
            'description' => 'Barely used T-square. Need French curves for my architecture assignment.',
            'phone' => '+880 1733 000003',
            'images' => ['https://images.unsplash.com/photo-1503602642458-232111445657?w=500&q=70'],
            'status' => 'Completed',
            'created_at' => Carbon::now()->subDays(5),
        ]);

        $this->command->info('Exchange posts and requests seeded successfully.');
    }
}
