<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Creates roles and permissions as defined in the MyCampus context.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Student permissions
        $studentPermissions = [
            'view dashboard',
            'manage profile',
            'create marketplace listings',
            'create exchange posts',
            'upload resources',
            'create blood requests',
            'create roommate posts',
            'create lost reports',
            'create found reports',
            'save content',
            'report content',
            'receive notifications',
        ];

        // Admin permissions
        $adminPermissions = [
            'approve registrations',
            'reject registrations',
            'manage users',
            'moderate content',
            'moderate reports',
            'manage announcements',
            'view analytics',
        ];

        // Create all permissions
        foreach (array_merge($studentPermissions, $adminPermissions) as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Create roles and assign permissions
        $studentRole = Role::firstOrCreate(['name' => 'student']);
        $studentRole->syncPermissions($studentPermissions);

        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $adminRole->syncPermissions(array_merge($studentPermissions, $adminPermissions));
    }
}
