<?php

namespace Tests\Feature;

use App\Models\Resource;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ResourceTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_upload_and_list_academic_resources(): void
    {
        Storage::fake('public');
        $user = User::factory()->create(['registration_status' => 'approved']);

        $file = UploadedFile::fake()->create('cse220_lecture_notes.pdf', 500, 'application/pdf');

        $payload = [
            'title' => 'Data Structures Lecture 1-5 Notes',
            'description' => 'Complete handwritten notes for binary search trees and heaps.',
            'department' => 'CSE',
            'course_code' => 'CSE 2201',
            'semester' => '2-2',
            'academic_year' => '2023-2024',
            'resource_type' => 'Notes',
            'file' => $file,
        ];

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/resources', $payload);
        $response->assertStatus(201);

        $this->assertDatabaseHas('resources', [
            'user_id' => $user->id,
            'title' => 'Data Structures Lecture 1-5 Notes',
            'course_code' => 'CSE 2201',
        ]);

        $listResponse = $this->actingAs($user, 'sanctum')->getJson('/api/resources?department=CSE');
        $listResponse->assertStatus(200);
        $listResponse->assertJsonFragment(['title' => 'Data Structures Lecture 1-5 Notes']);
    }

    public function test_owner_can_delete_resource(): void
    {
        $user = User::factory()->create(['registration_status' => 'approved']);
        $resource = Resource::create([
            'user_id' => $user->id,
            'title' => 'Old Assignment Solution',
            'department' => 'CSE',
            'course_code' => 'CSE 1101',
            'semester' => '1-1',
            'resource_type' => 'Assignment',
            'file_path' => 'resources/assignment1.pdf',
            'file_name' => 'assignment1.pdf',
            'file_size' => '500 KB',
        ]);

        $deleteResponse = $this->actingAs($user, 'sanctum')->deleteJson("/api/resources/{$resource->id}");
        $deleteResponse->assertStatus(200);

        $this->assertDatabaseMissing('resources', [
            'id' => $resource->id,
        ]);
    }
}
