<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Workspace;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserManagementUpdateTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_admin_can_update_a_member(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $workspace = Workspace::create([
            'name' => 'Team Space',
            'slug' => 'team-space',
            'owner_id' => $admin->id,
        ]);

        $member = User::factory()->create([
            'status' => 'active',
        ]);
        $member->assignRole('member');

        $workspace->users()->attach($member->id, [
            'role' => 'member',
            'joined_at' => now(),
        ]);

        $this->actingAs($admin)
            ->patch(route('users.update', $member), [
                'workspace_ids' => [$workspace->id],
                'name' => 'Miembro Editado',
                'email' => 'editado@smartsend.test',
                'password' => '',
                'password_confirmation' => '',
                'role' => 'project_manager',
                'status' => 'inactive',
            ])
            ->assertRedirect(route('users.index'));

        $member->refresh();

        $this->assertSame('Miembro Editado', $member->name);
        $this->assertSame('editado@smartsend.test', $member->email);
        $this->assertSame('inactive', $member->status);
        $this->assertTrue($member->hasRole('project_manager'));
    }

    public function test_admin_can_update_a_member_with_multiple_workspaces(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $workspaceA = Workspace::create([
            'name' => 'Workspace A',
            'slug' => 'workspace-a',
            'owner_id' => $admin->id,
        ]);

        $workspaceB = Workspace::create([
            'name' => 'Workspace B',
            'slug' => 'workspace-b',
            'owner_id' => $admin->id,
        ]);

        $member = User::factory()->create();
        $member->assignRole('member');
        $workspaceA->users()->attach($member->id, ['role' => 'member', 'joined_at' => now()]);

        $this->actingAs($admin)
            ->patch(route('users.update', $member), [
                'workspace_ids' => [$workspaceA->id, $workspaceB->id],
                'name' => $member->name,
                'email' => $member->email,
                'password' => '',
                'password_confirmation' => '',
                'role' => 'member',
                'status' => 'active',
            ])
            ->assertRedirect(route('users.index'));

        $this->assertEqualsCanonicalizing(
            [$workspaceA->id, $workspaceB->id],
            $member->fresh()->workspaces->pluck('id')->all()
        );
    }

    public function test_admin_can_deactivate_member(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $workspace = Workspace::create([
            'name' => 'Team Space',
            'slug' => 'team-space-delete',
            'owner_id' => $admin->id,
        ]);

        $member = User::factory()->create();
        $member->assignRole('member');
        $workspace->users()->attach($member->id, ['role' => 'member', 'joined_at' => now()]);

        $this->actingAs($admin)
            ->patch(route('users.deactivate', $member))
            ->assertRedirect(route('users.index'));

        $this->assertDatabaseHas('users', [
            'id' => $member->id,
            'status' => 'inactive',
        ]);
    }
}
