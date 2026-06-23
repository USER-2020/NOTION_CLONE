<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $permissions = [
            'dashboard.view',
            'users.manage',
            'roles.manage',
            'workspaces.view',
            'workspaces.create',
            'workspaces.update',
            'projects.view',
            'projects.create',
            'projects.update',
            'projects.delete',
            'tasks.view',
            'tasks.manage',
            'pages.view',
            'pages.edit',
            'comments.create',
            'files.manage',
            'activity.view',
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        $map = [
            'super_admin' => $permissions,
            'admin' => $permissions,
            'project_manager' => [
                'dashboard.view',
                'workspaces.view',
                'projects.view',
                'projects.create',
                'projects.update',
                'tasks.view',
                'tasks.manage',
                'pages.view',
                'pages.edit',
                'comments.create',
                'files.manage',
                'activity.view',
            ],
            'member' => [
                'dashboard.view',
                'workspaces.view',
                'projects.view',
                'tasks.view',
                'pages.view',
                'comments.create',
                'activity.view',
            ],
            'viewer' => [
                'dashboard.view',
                'workspaces.view',
                'projects.view',
                'tasks.view',
                'pages.view',
                'activity.view',
            ],
        ];

        foreach ($map as $roleName => $rolePermissions) {
            $role = Role::findOrCreate($roleName, 'web');
            $role->syncPermissions($rolePermissions);
        }
    }
}
