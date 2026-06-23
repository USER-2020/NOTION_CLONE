<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use App\Models\Workspace;
use App\Notifications\MemberWelcomeNotification;
use App\Notifications\TaskAssignedNotification;
use App\Notifications\TaskCommentNotification;
use App\Notifications\TaskStatusChangedNotification;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class TaskAndMemberNotificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_member_creation_sends_welcome_email_to_created_user(): void
    {
        Notification::fake();

        [$admin, $workspace] = $this->workspaceFixture();

        $this->actingAs($admin)->post(route('users.store'), [
            'workspace_id' => $workspace->id,
            'name' => 'Nuevo Miembro',
            'email' => 'nuevo@smartsend.test',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'member',
            'status' => 'active',
        ])->assertRedirect(route('users.index'));

        $createdUser = User::where('email', 'nuevo@smartsend.test')->firstOrFail();

        Notification::assertSentTo($createdUser, MemberWelcomeNotification::class);
        $this->assertTrue($createdUser->must_change_password);
    }

    public function test_assigning_a_task_sends_email_to_new_assignees(): void
    {
        Notification::fake();

        [$manager, $member, $project] = $this->projectFixture();

        $task = Task::create([
            'project_id' => $project->id,
            'title' => 'Preparar correo de lanzamiento',
            'description' => 'Redactar contenido inicial.',
            'status' => 'todo',
            'priority' => 'medium',
            'reporter_id' => $manager->id,
            'position' => 0,
        ]);

        $this->actingAs($manager)->patch(route('tasks.update', $task), [
            'project_id' => $project->id,
            'title' => $task->title,
            'description' => $task->description,
            'status' => $task->status,
            'priority' => $task->priority,
            'assignee_ids' => [$member->id],
            'due_date' => null,
            'position' => $task->position,
        ])->assertRedirect();

        Notification::assertSentTo($member, TaskAssignedNotification::class);
    }

    public function test_moving_a_task_sends_status_email_to_assigned_members(): void
    {
        Notification::fake();

        [$manager, $member, $project] = $this->projectFixture();

        $task = Task::create([
            'project_id' => $project->id,
            'title' => 'Revisar acceso del equipo',
            'description' => 'Validar usuarios activos.',
            'status' => 'todo',
            'priority' => 'high',
            'reporter_id' => $manager->id,
            'position' => 0,
            'assignee_id' => $member->id,
        ]);
        $task->assignees()->sync([$member->id]);

        $this->actingAs($manager)->patch(route('tasks.move', $task), [
            'status' => 'in_progress',
            'position' => 0,
        ])->assertRedirect();

        Notification::assertSentTo($member, TaskStatusChangedNotification::class);
    }

    public function test_task_update_can_create_subtasks_with_assignees_in_single_save(): void
    {
        [$manager, $member, $project] = $this->projectFixture();

        $task = Task::create([
            'project_id' => $project->id,
            'title' => 'Preparar rollout',
            'description' => 'Tarea principal.',
            'status' => 'todo',
            'priority' => 'medium',
            'reporter_id' => $manager->id,
            'position' => 0,
        ]);

        $this->actingAs($manager)->patch(route('tasks.update', $task), [
            'project_id' => $project->id,
            'title' => $task->title,
            'description' => $task->description,
            'status' => $task->status,
            'priority' => $task->priority,
            'assignee_ids' => [],
            'start_date' => null,
            'due_date' => null,
            'position' => $task->position,
            'subtasks' => [
                [
                    'title' => 'Definir checklist',
                    'status' => 'todo',
                    'assignee_ids' => [$member->id],
                    'start_date' => '2026-06-23',
                    'due_date' => '2026-06-24',
                ],
            ],
        ])->assertRedirect();

        $subtask = $task->children()->first();

        $this->assertNotNull($subtask);
        $this->assertSame('Definir checklist', $subtask->title);
        $this->assertSame('todo', $subtask->status);
        $this->assertSame('2026-06-23', $subtask->start_date?->toDateString());
        $this->assertSame('2026-06-24', $subtask->due_date?->toDateString());
        $this->assertSame([$member->id], $subtask->assignees()->pluck('users.id')->all());
    }

    public function test_adding_a_comment_sends_email_to_project_participants_except_actor(): void
    {
        Notification::fake();

        [$manager, $member, $project] = $this->projectFixture();

        $secondaryManager = User::factory()->create();
        $secondaryManager->assignRole('project_manager');
        $project->workspace->users()->attach($secondaryManager->id, ['role' => 'project_manager']);
        $project->members()->attach($secondaryManager->id, ['role' => 'project_manager']);

        $task = Task::create([
            'project_id' => $project->id,
            'title' => 'Coordinar aprobacion interna',
            'description' => 'Revisar feedback del equipo.',
            'status' => 'todo',
            'priority' => 'medium',
            'reporter_id' => $manager->id,
            'position' => 0,
            'assignee_id' => $member->id,
        ]);
        $task->assignees()->sync([$member->id]);

        $this->actingAs($member)->post(route('tasks.comments.store', $task), [
            'body' => 'Ya deje el contexto y el siguiente paso para continuar.',
        ])->assertRedirect();

        Notification::assertSentTo($manager, TaskCommentNotification::class);
        Notification::assertSentTo($secondaryManager, TaskCommentNotification::class);
        Notification::assertNotSentTo($member, TaskCommentNotification::class);
    }

    private function workspaceFixture(): array
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $workspace = Workspace::create([
            'name' => 'Equipo Comercial',
            'slug' => 'equipo-comercial',
            'owner_id' => $admin->id,
        ]);

        return [$admin, $workspace];
    }

    private function projectFixture(): array
    {
        [$admin, $workspace] = $this->workspaceFixture();

        $manager = User::factory()->create();
        $manager->assignRole('project_manager');
        $workspace->users()->attach($manager->id, ['role' => 'project_manager']);

        $member = User::factory()->create();
        $member->assignRole('member');
        $workspace->users()->attach($member->id, ['role' => 'member']);

        $project = Project::create([
            'workspace_id' => $workspace->id,
            'name' => 'Automation Rollout',
            'slug' => 'automation-rollout',
            'status' => 'active',
            'priority' => 'high',
            'owner_id' => $manager->id,
            'color' => '#7f23ce',
        ]);

        $project->members()->attach($manager->id, ['role' => 'lead']);
        $project->members()->attach($member->id, ['role' => 'member']);

        return [$manager, $member, $project, $admin];
    }
}
