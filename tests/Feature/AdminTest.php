<?php

namespace Tests\Feature;

use App\Enums\RegistrationStatus;
use App\Models\Announcement;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_admin_cannot_access_admin_routes(): void
    {
        $student = User::factory()->create([
            'role' => 'student',
            'registration_status' => 'approved',
        ]);

        $response = $this->actingAs($student, 'sanctum')->getJson('/api/admin/stats');
        $response->assertStatus(403);
    }

    public function test_admin_can_view_stats_dashboard(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'registration_status' => 'approved',
        ]);

        $response = $this->actingAs($admin, 'sanctum')->getJson('/api/admin/stats');
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'analytics' => ['totalUsers', 'activeUsers', 'pendingRegistrations', 'marketplaceItems', 'resources'],
            'pendingUsers',
            'recentReports',
        ]);
    }

    public function test_admin_can_approve_and_reject_student_registrations(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'registration_status' => 'approved',
        ]);

        $pendingStudent1 = User::factory()->create([
            'registration_status' => 'pending',
        ]);

        $pendingStudent2 = User::factory()->create([
            'registration_status' => 'pending',
        ]);

        // Approve student 1
        $approveResponse = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/admin/registrations/{$pendingStudent1->id}/approve");
        $approveResponse->assertStatus(200);

        $this->assertDatabaseHas('users', [
            'id' => $pendingStudent1->id,
            'registration_status' => RegistrationStatus::Approved->value,
        ]);

        // Reject student 2
        $rejectResponse = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/admin/registrations/{$pendingStudent2->id}/reject", [
                'rejection_reason' => 'Student ID photo is blurry and unreadable.',
            ]);
        $rejectResponse->assertStatus(200);

        $this->assertDatabaseHas('users', [
            'id' => $pendingStudent2->id,
            'registration_status' => RegistrationStatus::Rejected->value,
            'rejection_reason' => 'Student ID photo is blurry and unreadable.',
        ]);
    }

    public function test_admin_can_manage_campus_announcements(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'registration_status' => 'approved',
        ]);

        // Create announcement
        $createResponse = $this->actingAs($admin, 'sanctum')->postJson('/api/admin/announcements', [
            'title' => 'Midterm Exam Schedule Published',
            'body' => 'All departmental midterm schedules are available on notice board.',
            'category' => 'Academic',
            'is_pinned' => false,
        ]);
        $createResponse->assertStatus(201);

        $announcement = Announcement::where('title', 'Midterm Exam Schedule Published')->first();
        $this->assertNotNull($announcement);

        // Toggle pin
        $pinResponse = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/admin/announcements/{$announcement->id}/toggle-pin");
        $pinResponse->assertStatus(200);

        $this->assertDatabaseHas('announcements', [
            'id' => $announcement->id,
            'is_pinned' => true,
        ]);

        // Delete announcement
        $deleteResponse = $this->actingAs($admin, 'sanctum')
            ->deleteJson("/api/admin/announcements/{$announcement->id}");
        $deleteResponse->assertStatus(200);

        $this->assertDatabaseMissing('announcements', [
            'id' => $announcement->id,
        ]);
    }
}
