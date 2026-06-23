<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use App\Models\Workspace;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class WorkspaceAndProjectLogoUploadTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_workspace_can_be_created_with_an_optional_logo(): void
    {
        Storage::fake('public');

        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $response = $this->actingAs($admin)->post(route('workspaces.store'), [
            'name' => 'Studio Ops',
            'description' => 'Workspace con identidad visual.',
            'owner_id' => $admin->id,
            'logo' => UploadedFile::fake()->image('workspace-logo.png'),
        ]);

        $response->assertRedirect(route('workspaces.index'));

        $workspace = Workspace::where('slug', 'studio-ops')->firstOrFail();

        $this->assertNotNull($workspace->logo_path);
        Storage::disk('public')->assertExists($workspace->logo_path);
    }

    public function test_project_logo_can_be_uploaded_on_update(): void
    {
        Storage::fake('public');

        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $workspace = Workspace::create([
            'name' => 'Client Delivery',
            'slug' => 'client-delivery',
            'owner_id' => $admin->id,
        ]);

        $project = Project::create([
            'workspace_id' => $workspace->id,
            'name' => 'Launch System',
            'slug' => 'launch-system',
            'status' => 'active',
            'priority' => 'medium',
            'owner_id' => $admin->id,
            'color' => '#7f23ce',
        ]);

        $this->actingAs($admin)->patch(route('projects.update', $project), [
            'workspace_id' => $workspace->id,
            'name' => $project->name,
            'description' => '',
            'status' => 'active',
            'priority' => 'medium',
            'start_date' => '',
            'due_date' => '',
            'icon' => 'folder',
            'color' => '#7f23ce',
            'manager_ids' => [],
            'member_ids' => [],
            'logo' => UploadedFile::fake()->image('project-logo.png'),
        ])->assertRedirect(route('projects.show', $project));

        $project->refresh();

        $this->assertNotNull($project->logo_path);
        Storage::disk('public')->assertExists($project->logo_path);
    }

    public function test_workspace_logo_can_be_uploaded_on_update_via_method_spoofed_form_request(): void
    {
        Storage::fake('public');

        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $workspace = Workspace::create([
            'name' => 'Client Delivery',
            'slug' => 'client-delivery',
            'owner_id' => $admin->id,
        ]);

        $workspace->users()->attach($admin->id, ['role' => 'admin']);

        $this->actingAs($admin)->post(route('workspaces.update', $workspace), [
            '_method' => 'patch',
            'name' => $workspace->name,
            'description' => 'Workspace con logo actualizado.',
            'owner_id' => $admin->id,
            'logo' => UploadedFile::fake()->image('workspace-logo.png'),
        ])->assertRedirect(route('workspaces.index'));

        $workspace->refresh();

        $this->assertNotNull($workspace->logo_path);
        Storage::disk('public')->assertExists($workspace->logo_path);
    }

    public function test_project_detail_includes_workspace_logo_url(): void
    {
        Storage::fake('public');

        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $workspace = Workspace::create([
            'name' => 'Client Delivery',
            'slug' => 'client-delivery',
            'owner_id' => $admin->id,
            'logo_path' => UploadedFile::fake()->image('workspace-logo.png')->store('workspaces/1/logo', 'public'),
        ]);

        $project = Project::create([
            'workspace_id' => $workspace->id,
            'name' => 'Launch System',
            'slug' => 'launch-system',
            'status' => 'active',
            'priority' => 'medium',
            'owner_id' => $admin->id,
            'color' => '#7f23ce',
        ]);

        $this->actingAs($admin)
            ->get(route('projects.show', $project))
            ->assertInertia(fn (Assert $page) => $page
                ->where('project.workspace.id', $workspace->id)
                ->where('project.workspace.name', $workspace->name)
                ->where('project.workspace.logo_url', Storage::disk('public')->url($workspace->logo_path))
            );
    }

    public function test_project_manager_can_update_a_workspace(): void
    {
        $owner = User::factory()->create();
        $owner->assignRole('admin');

        $manager = User::factory()->create();
        $manager->assignRole('project_manager');

        $workspace = Workspace::create([
            'name' => 'Client Delivery',
            'slug' => 'client-delivery',
            'owner_id' => $owner->id,
        ]);

        $workspace->users()->attach($manager->id, ['role' => 'project_manager']);

        $this->actingAs($manager)->patch(route('workspaces.update', $workspace), [
            'name' => 'Client Delivery Updated',
            'description' => 'Workspace actualizado por gestor.',
            'owner_id' => $owner->id,
        ])->assertRedirect(route('workspaces.index'));

        $workspace->refresh();

        $this->assertSame('Client Delivery Updated', $workspace->name);
        $this->assertSame('Workspace actualizado por gestor.', $workspace->description);
    }

    public function test_admin_can_delete_workspace(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $workspace = Workspace::create([
            'name' => 'Workspace To Delete',
            'slug' => 'workspace-to-delete',
            'owner_id' => $admin->id,
        ]);

        $workspace->users()->attach($admin->id, ['role' => 'admin']);

        $this->actingAs($admin)
            ->delete(route('workspaces.destroy', $workspace))
            ->assertRedirect(route('workspaces.index'));

        $this->assertDatabaseMissing('workspaces', [
            'id' => $workspace->id,
        ]);
    }

    public function test_admin_can_delete_project(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $workspace = Workspace::create([
            'name' => 'Workspace To Delete Project',
            'slug' => 'workspace-to-delete-project',
            'owner_id' => $admin->id,
        ]);

        $project = Project::create([
            'workspace_id' => $workspace->id,
            'name' => 'Project To Delete',
            'slug' => 'project-to-delete',
            'status' => 'active',
            'priority' => 'medium',
            'owner_id' => $admin->id,
            'color' => '#7f23ce',
        ]);

        $this->actingAs($admin)
            ->delete(route('projects.destroy', $project))
            ->assertRedirect(route('projects.index'));

        $this->assertDatabaseMissing('projects', [
            'id' => $project->id,
        ]);
    }
}
