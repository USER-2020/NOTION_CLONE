<?php

namespace Tests\Feature;

use App\Models\Comment;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use App\Models\Workspace;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MemberTaskScheduleAndCommentAttachmentTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_member_can_update_task_and_subtask_dates(): void
    {
        [$member, $task, $subtask] = $this->taskFixture();

        $this->actingAs($member)
            ->patch(route('tasks.schedule', $task), [
                'start_date' => '2026-06-23',
                'due_date' => '2026-06-30',
            ])
            ->assertRedirect();

        $this->actingAs($member)
            ->patch(route('tasks.subtasks.schedule', [$task, $subtask]), [
                'start_date' => '2026-06-24',
                'due_date' => '2026-06-28',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'start_date' => '2026-06-23 00:00:00',
            'due_date' => '2026-06-30 00:00:00',
        ]);

        $this->assertDatabaseHas('tasks', [
            'id' => $subtask->id,
            'start_date' => '2026-06-24 00:00:00',
            'due_date' => '2026-06-28 00:00:00',
        ]);
    }

    public function test_member_can_add_attachments_when_commenting(): void
    {
        Storage::fake('public');

        [$member, $task] = $this->taskFixture();

        $this->actingAs($member)
            ->post(route('tasks.comments.store', $task), [
                'body' => 'Comparto evidencia y contexto.',
                'files' => [
                    UploadedFile::fake()->image('evidencia.png'),
                ],
            ])
            ->assertRedirect();

        $comment = Comment::query()->where('user_id', $member->id)->latest()->firstOrFail();

        $this->assertDatabaseHas('attachments', [
            'attachable_type' => Comment::class,
            'attachable_id' => $comment->id,
            'uploaded_by' => $member->id,
            'name' => 'evidencia.png',
        ]);
    }

    private function taskFixture(): array
    {
        $manager = User::factory()->create();
        $manager->assignRole('project_manager');

        $member = User::factory()->create();
        $member->assignRole('member');

        $workspace = Workspace::create([
            'name' => 'Delivery Team',
            'slug' => 'delivery-team',
            'owner_id' => $manager->id,
        ]);

        $workspace->users()->attach($manager->id, ['role' => 'project_manager']);
        $workspace->users()->attach($member->id, ['role' => 'member']);

        $project = Project::create([
            'workspace_id' => $workspace->id,
            'name' => 'Operations Rollout',
            'slug' => 'operations-rollout',
            'status' => 'active',
            'priority' => 'medium',
            'owner_id' => $manager->id,
            'color' => '#7f23ce',
        ]);

        $project->members()->attach($manager->id, ['role' => 'project_manager']);
        $project->members()->attach($member->id, ['role' => 'member']);

        $task = Task::create([
            'project_id' => $project->id,
            'title' => 'Organizar despliegue',
            'description' => 'Tarea principal.',
            'status' => 'todo',
            'priority' => 'medium',
            'reporter_id' => $manager->id,
            'position' => 0,
        ]);
        $task->assignees()->sync([$member->id]);

        $subtask = Task::create([
            'project_id' => $project->id,
            'parent_id' => $task->id,
            'title' => 'Preparar assets',
            'description' => null,
            'status' => 'todo',
            'priority' => 'medium',
            'reporter_id' => $manager->id,
            'position' => 0,
        ]);
        $subtask->assignees()->sync([$member->id]);

        return [$member, $task, $subtask];
    }
}
