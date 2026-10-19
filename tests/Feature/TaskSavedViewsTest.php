<?php

namespace Tests\Feature;

use App\Models\TaskView;
use App\Models\User;
use App\Models\Workspace;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskSavedViewsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_user_can_save_and_load_a_task_view_for_the_current_workspace(): void
    {
        $owner = User::factory()->create();
        $owner->assignRole('admin');
        $workspace = Workspace::create([
            'name' => 'Planning Workspace',
            'slug' => 'planning-workspace',
            'owner_id' => $owner->id,
        ]);

        $this->actingAs($owner)
            ->post(route('task-views.store'), [
                'name' => 'Prioridad alta',
                'view_type' => 'scrum',
                'filters' => [
                    'priority' => 'high',
                    'status' => 'in_progress',
                ],
            ])
            ->assertRedirect();

        $view = TaskView::firstOrFail();
        $this->assertSame($workspace->id, $view->workspace_id);
        $this->assertSame($owner->id, $view->user_id);
        $this->assertSame('high', $view->filters['priority']);
        $this->assertSame('in_progress', $view->filters['status']);

        $this->actingAs($owner)
            ->get(route('tasks.index'))
            ->assertInertia(fn ($page) => $page
                ->component('Tasks/Index')
                ->where('savedViews.0.name', 'Prioridad alta')
                ->where('savedViews.0.filters.priority', 'high')
                ->where('savedViews.0.filters.status', 'in_progress'));
    }

    public function test_user_cannot_modify_another_users_saved_view(): void
    {
        $owner = User::factory()->create();
        $owner->assignRole('admin');
        $workspace = Workspace::create([
            'name' => 'Private Workspace',
            'slug' => 'private-workspace',
            'owner_id' => $owner->id,
        ]);
        $view = TaskView::create([
            'workspace_id' => $workspace->id,
            'user_id' => $owner->id,
            'name' => 'Privada',
            'view_type' => 'calendar',
            'filters' => ['priority' => 'all', 'status' => 'all'],
        ]);
        $outsider = User::factory()->create();
        $outsider->assignRole('viewer');

        $this->actingAs($outsider)
            ->patch(route('task-views.update', $view), [
                'name' => 'Intento',
                'view_type' => 'scrum',
            ])
            ->assertForbidden();

        $this->actingAs($outsider)
            ->delete(route('task-views.destroy', $view))
            ->assertForbidden();

        $this->assertDatabaseHas('task_views', ['id' => $view->id, 'name' => 'Privada']);
    }
}
