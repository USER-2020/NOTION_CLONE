<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use App\Models\Workspace;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
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
}
