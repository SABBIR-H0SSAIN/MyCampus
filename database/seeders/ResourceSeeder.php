<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Resource;
use App\Models\User;

class ResourceSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();
        if ($users->isEmpty()) {
            return;
        }

        $resources = [
            [
                'title' => 'Operating Systems - Process Synchronization Notes',
                'description' => 'Comprehensive notes covering semaphores, mutexes, and deadlocks.',
                'department' => 'CSE',
                'course_code' => 'CSE 3201',
                'semester' => '3-2',
                'academic_year' => '2023',
                'resource_type' => 'Notes',
                'external_links' => ['https://example.com/os-notes'],
                'file_path' => 'resources/dummy.pdf',
                'file_name' => 'OS_Notes.pdf',
                'file_size' => '2.5 MB'
            ],
            [
                'title' => 'Data Structures Final Cheat Sheet',
                'description' => 'A quick cheat sheet for the final exam. Covers trees, graphs, and DP.',
                'department' => 'CSE',
                'course_code' => 'CSE 2101',
                'semester' => '2-1',
                'academic_year' => '2022',
                'resource_type' => 'Cheatsheets',
                'external_links' => ['https://example.com/ds-cheatsheet'],
                'file_path' => 'resources/dummy.pdf',
                'file_name' => 'DS_CheatSheet.pdf',
                'file_size' => '1.1 MB'
            ],
            [
                'title' => 'Electrical Circuits II Past Papers (2018-2022)',
                'description' => 'Collected past papers for midterms and finals.',
                'department' => 'EEE',
                'course_code' => 'EEE 2103',
                'semester' => '2-1',
                'academic_year' => null,
                'resource_type' => 'Past Papers',
                'external_links' => ['https://example.com/eee-past-papers', 'https://example.com/eee-past-papers-2'],
                'file_path' => 'resources/dummy.zip',
                'file_name' => 'EEE_2103_Past_Papers.zip',
                'file_size' => '15.4 MB'
            ],
            [
                'title' => 'Mechanics of Materials Slides',
                'description' => 'Official slides from Prof. XYZ.',
                'department' => 'ME',
                'course_code' => 'ME 2101',
                'semester' => '2-1',
                'academic_year' => '2024',
                'resource_type' => 'Slides',
                'external_links' => null,
                'file_path' => 'resources/dummy.pptx',
                'file_name' => 'Mechanics_Slides.pptx',
                'file_size' => '8.2 MB'
            ]
        ];

        foreach ($resources as $resourceData) {
            $resourceData['user_id'] = $users->random()->id;
            Resource::create($resourceData);
        }
    }
}
