<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use App\Models\Workspace;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardMetricsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_dashboard_exposes_real_task_distributions_and_weekly_completion(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $workspace = Workspace::create([
            'name' => 'Metrics Workspace',
            'slug' => 'metrics-workspace',
            'owner_id' => $admin->id,
        ]);

        $project = Project::create([
            'workspace_id' => $workspace->id,
            'name' => 'Metrics Project',
            'slug' => 'metrics-project',
            'owner_id' => $admin->id,
            'color' => '#7c3aed',
            'is_favorite' => true,
        ]);

        Task::create([
            'project_id' => $project->id,
            'title' => 'Open task',
            'status' => 'todo',
            'priority' => 'medium',
        ]);

        Task::create([
            'project_id' => $project->id,
            'title' => 'Completed task',
            'status' => 'done',
            'priority' => 'high',
            'completed_at' => now()->subDay(),
        ]);

        Task::create([
            'project_id' => $project->id,
            'title' => 'Blocked task',
            'status' => 'blocked',
            'priority' => 'urgent',
        ]);

        $this->actingAs($admin)
            ->get(route('dashboard'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard')
                ->where('taskStatusDistribution.1.key', 'todo')
                ->where('taskStatusDistribution.1.count', 1)
                ->where('taskStatusDistribution.4.key', 'done')
                ->where('taskStatusDistribution.4.count', 1)
                ->where('taskStatusDistribution.5.count', 1)
                ->where('taskPriorityDistribution.1.count', 1)
                ->where('taskPriorityDistribution.2.count', 1)
                ->where('taskPriorityDistribution.3.count', 1)
                ->has('weeklyCompletion', 7)
                ->where('weeklyCompletion.5.count', 1)
            );
    }
}
