<?php

namespace Tests\Feature;

use App\Models\Page;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use App\Models\Workspace;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthorizationFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_user_not_assigned_cannot_view_project(): void
    {
        [$project] = $this->projectFixture();
        $outsider = User::factory()->create();
        $outsider->assignRole('viewer');

        $this->actingAs($outsider)
            ->get(route('projects.show', $project))
            ->assertForbidden();
    }

    public function test_assigned_user_can_view_project(): void
    {
        [$project, $manager] = $this->projectFixture();

        $this->actingAs($manager)
            ->get(route('projects.show', $project))
            ->assertOk()
            ->assertSee($project->name);
    }

    public function test_user_cannot_see_task_from_hidden_project_in_index(): void
    {
        [$project] = $this->projectFixture();
        $task = Task::create([
            'project_id' => $project->id,
            'title' => 'Private launch task',
            'status' => 'todo',
            'priority' => 'high',
            'position' => 1,
        ]);

        $outsider = User::factory()->create();
        $outsider->assignRole('viewer');

        $this->actingAs($outsider)
            ->get(route('tasks.index'))
            ->assertOk()
            ->assertDontSee($task->title);
    }

    public function test_viewer_cannot_edit_pages(): void
    {
        [$project, $manager, $member, $workspace] = $this->projectFixture();

        $page = Page::create([
            'workspace_id' => $workspace->id,
            'project_id' => $project->id,
            'title' => 'Read Only Page',
            'slug' => 'read-only-page',
            'created_by' => $member->id,
            'updated_by' => $member->id,
        ]);

        $viewer = User::factory()->create();
        $viewer->assignRole('viewer');
        $project->members()->attach($viewer->id, ['role' => 'viewer']);
        $workspace->users()->attach($viewer->id, ['role' => 'viewer']);

        $this->actingAs($viewer)
            ->patch(route('pages.update', $page), [
                'workspace_id' => $workspace->id,
                'project_id' => $project->id,
                'title' => 'Blocked edit',
            ])
            ->assertForbidden();
    }

    public function test_member_cannot_update_project(): void
    {
        [$project, $manager, $member, $workspace] = $this->projectFixture();

        $this->actingAs($member)
            ->patch(route('projects.update', $project), [
                'workspace_id' => $workspace->id,
                'name' => 'Blocked update',
                'description' => '',
                'status' => 'active',
                'priority' => 'high',
                'start_date' => '',
                'due_date' => '',
                'icon' => 'folder',
                'color' => '#0f766e',
                'manager_ids' => [$manager->id],
                'member_ids' => [$member->id],
            ])
            ->assertForbidden();
    }

    public function test_member_cannot_update_workspace(): void
    {
        [, , $member, $workspace] = $this->projectFixture();

        $this->actingAs($member)
            ->patch(route('workspaces.update', $workspace), [
                'name' => 'Blocked workspace update',
                'description' => 'No permitido.',
                'owner_id' => $workspace->owner_id,
            ])
            ->assertForbidden();
    }

    public function test_member_cannot_create_workspace(): void
    {
        [, , $member] = $this->projectFixture();

        $this->actingAs($member)
            ->post(route('workspaces.store'), [
                'name' => 'Blocked workspace',
                'description' => 'No permitido.',
                'owner_id' => $member->id,
            ])
            ->assertForbidden();
    }

    private function projectFixture(): array
    {
        $owner = User::factory()->create();
        $owner->assignRole('admin');

        $manager = User::factory()->create();
        $manager->assignRole('project_manager');

        $member = User::factory()->create();
        $member->assignRole('member');

        $workspace = Workspace::create([
            'name' => 'Secure Workspace',
            'slug' => 'secure-workspace',
            'owner_id' => $owner->id,
        ]);

        $workspace->users()->attach($manager->id, ['role' => 'project_manager']);
        $workspace->users()->attach($member->id, ['role' => 'member']);

        $project = Project::create([
            'workspace_id' => $workspace->id,
            'name' => 'Secure Project',
            'slug' => 'secure-project',
            'status' => 'active',
            'priority' => 'high',
            'owner_id' => $manager->id,
            'color' => '#0f766e',
        ]);

        $project->members()->attach($manager->id, ['role' => 'lead']);
        $project->members()->attach($member->id, ['role' => 'member']);

        return [$project, $manager, $member, $workspace];
    }
}
