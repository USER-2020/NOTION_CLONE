<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use App\Models\Workspace;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectParticipantSyncTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_project_update_preserves_selected_member_ids_when_syncing_participants(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $manager = User::factory()->create();
        $manager->assignRole('project_manager');

        $member = User::factory()->create();
        $member->assignRole('member');

        $workspace = Workspace::create([
            'name' => 'Ops Workspace',
            'slug' => 'ops-workspace',
            'owner_id' => $admin->id,
        ]);

        $workspace->users()->attach($manager->id, ['role' => 'project_manager']);
        $workspace->users()->attach($member->id, ['role' => 'member']);

        $project = Project::create([
            'workspace_id' => $workspace->id,
            'name' => 'Sync Project',
            'slug' => 'sync-project',
            'status' => 'active',
            'priority' => 'medium',
            'owner_id' => $admin->id,
            'color' => '#7f23ce',
        ]);

        $this->actingAs($admin)
            ->patch(route('projects.update', $project), [
                'workspace_id' => $workspace->id,
                'name' => $project->name,
                'description' => '',
                'status' => 'active',
                'priority' => 'medium',
                'start_date' => '',
                'due_date' => '',
                'icon' => 'folder',
                'color' => '#7f23ce',
                'manager_ids' => [$manager->id],
                'member_ids' => [$member->id],
            ])
            ->assertRedirect(route('projects.show', $project));

        $this->assertDatabaseHas('project_user', [
            'project_id' => $project->id,
            'user_id' => $manager->id,
            'role' => 'project_manager',
        ]);

        $this->assertDatabaseHas('project_user', [
            'project_id' => $project->id,
            'user_id' => $member->id,
            'role' => 'member',
        ]);

        $this->assertDatabaseMissing('project_user', [
            'project_id' => $project->id,
            'user_id' => 0,
        ]);
    }
}
