<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Models\Attachment;
use App\Models\Comment;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use App\Models\Workspace;
use App\Notifications\TaskAssignedNotification;
use App\Notifications\TaskCommentNotification;
use App\Notifications\TaskStatusChangedNotification;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TaskController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Task::class);
        $currentWorkspace = Workspace::currentForUser($request->user(), $request->session()->get('current_workspace_id'));
        $projectId = $request->integer('project_id') ?: null;
        $taskId = $request->integer('task_id') ?: null;

        $visibleProjects = Project::query()
            ->visibleForUser($request->user())
            ->when($currentWorkspace, fn ($query) => $query->where('workspace_id', $currentWorkspace->id));

        $activeProject = $projectId
            ? (clone $visibleProjects)->whereKey($projectId)->first()
            : null;

        return Inertia::render('Tasks/Index', [
            'tasks' => Task::query()
                ->visibleForUser($request->user())
                ->when($currentWorkspace, fn ($query) => $query->whereHas('project', fn ($project) => $project->where('workspace_id', $currentWorkspace->id)))
                ->when($activeProject, fn ($query) => $query->where('project_id', $activeProject->id))
                ->whereNull('parent_id')
                ->with([
                    'project:id,name,color,owner_id',
                    'assignees:id,name',
                    'reporter:id,name',
                    'comments.user:id,name',
                    'comments.replies.user:id,name',
                    'attachments:id,attachable_id,attachable_type,uploaded_by,disk,path,name,mime_type,size,created_at',
                    'attachments.uploader:id,name',
                    'children.assignees:id,name',
                ])
                ->orderBy('position')
                ->get()
                ->map(fn (Task $task) => $this->serializeTask($task)),
            'projects' => (clone $visibleProjects)
                ->with(['owner:id,name', 'members:id,name'])
                ->get(['id', 'name', 'color', 'owner_id'])
                ->map(fn (Project $project) => [
                    'id' => $project->id,
                    'name' => $project->name,
                    'color' => $project->color,
                    'members' => $project->members
                        ->push($project->owner)
                        ->filter()
                        ->filter(fn (User $member) => ! ($request->user()->hasRole('admin') && $member->hasRole('super_admin')))
                        ->unique('id')
                        ->sortBy('name')
                        ->values()
                        ->map(fn (User $member) => [
                            'id' => $member->id,
                            'name' => $member->name,
                        ]),
                ]),
            'filters' => [
                'project_id' => $activeProject?->id,
                'task_id' => $taskId,
            ],
            'activeProject' => $activeProject ? [
                'id' => $activeProject->id,
                'name' => $activeProject->name,
            ] : null,
        ]);
    }

    public function store(StoreTaskRequest $request): RedirectResponse
    {
        $this->authorize('create', Task::class);

        $task = Task::create([
            ...collect($request->validated())->except('assignee_ids')->all(),
            'reporter_id' => $request->user()->id,
            'position' => $request->integer('position', $this->nextPosition($request->string('status')->toString())),
            'assignee_id' => collect($request->input('assignee_ids', []))->filter()->map(fn ($id) => (int) $id)->first(),
        ]);
        $this->syncTaskAssignees($task, $request->input('assignee_ids', []));
        $this->notifyAssignedMembers($task, [], $request->user());

        return back()->with('success', "Tarea '{$task->title}' creada correctamente.");
    }

    public function update(UpdateTaskRequest $request, Task $task): RedirectResponse
    {
        $this->authorize('update', $task);

        $originalStatus = $task->status;
        $originalAssigneeIds = $task->assignees()->pluck('users.id')->map(fn ($id) => (int) $id)->all();
        $payload = collect($request->validated())->except('assignee_ids')->all();
        if (($payload['status'] ?? $task->status) !== $task->status && ! array_key_exists('position', $payload)) {
            $payload['position'] = $this->nextPosition($payload['status']);
        }
        $payload['completed_at'] = ($payload['status'] ?? $task->status) === 'done' ? now() : null;
        $payload['assignee_id'] = collect($request->input('assignee_ids', []))->filter()->map(fn ($id) => (int) $id)->first();

        $task->update($payload);
        $this->syncTaskAssignees($task, $request->input('assignee_ids', []));
        $this->notifyAssignedMembers($task, $originalAssigneeIds, $request->user());
        $this->notifyStatusChange($task, $originalStatus, $payload['status'] ?? $originalStatus, $request->user());

        return back()->with('success', 'Tarea actualizada correctamente.');
    }

    public function storeSubtask(Request $request, Task $task): RedirectResponse
    {
        $this->authorize('update', $task);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'assignee_ids' => ['nullable', 'array'],
            'assignee_ids.*' => ['integer', 'exists:users,id'],
        ]);

        $memberIds = $task->project->members()->pluck('users.id')->push($task->project->owner_id);
        foreach ((array) ($validated['assignee_ids'] ?? []) as $assigneeId) {
            if (! $memberIds->contains((int) $assigneeId)) {
                return back()->withErrors(['assignee_ids' => 'Todos los responsables deben pertenecer al proyecto.']);
            }
        }

        $subtask = $task->children()->create([
            'project_id' => $task->project_id,
            'parent_id' => $task->id,
            'title' => $validated['title'],
            'description' => null,
            'status' => 'todo',
            'priority' => 'medium',
            'assignee_id' => collect($validated['assignee_ids'] ?? [])->filter()->map(fn ($id) => (int) $id)->first(),
            'reporter_id' => $request->user()->id,
            'position' => $this->nextChildPosition($task),
        ]);
        $this->syncTaskAssignees($subtask, $validated['assignee_ids'] ?? []);
        $this->notifyAssignedMembers($subtask, [], $request->user());

        return back()->with('success', 'Subtarea creada correctamente.');
    }

    public function updateSubtask(Request $request, Task $task, Task $subtask): RedirectResponse
    {
        $this->authorize('update', $task);
        $this->authorize('update', $subtask);

        abort_unless($subtask->parent_id === $task->id, 404);

        $originalStatus = $subtask->status;
        $originalAssigneeIds = $subtask->assignees()->pluck('users.id')->map(fn ($id) => (int) $id)->all();
        $validated = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'status' => ['sometimes', Rule::in(['todo', 'in_progress', 'done', 'blocked'])],
            'assignee_ids' => ['nullable', 'array'],
            'assignee_ids.*' => ['integer', 'exists:users,id'],
        ]);

        $memberIds = $task->project->members()->pluck('users.id')->push($task->project->owner_id);
        foreach ((array) ($validated['assignee_ids'] ?? []) as $assigneeId) {
            if (! $memberIds->contains((int) $assigneeId)) {
                return back()->withErrors(['assignee_ids' => 'Todos los responsables deben pertenecer al proyecto.']);
            }
        }

        if (array_key_exists('status', $validated)) {
            $validated['completed_at'] = $validated['status'] === 'done' ? now() : null;
        }

        if (array_key_exists('assignee_ids', $validated)) {
            $validated['assignee_id'] = collect($validated['assignee_ids'])->filter()->map(fn ($id) => (int) $id)->first();
        }

        $subtask->update(collect($validated)->except('assignee_ids')->all());
        if (array_key_exists('assignee_ids', $validated)) {
            $this->syncTaskAssignees($subtask, $validated['assignee_ids']);
        }
        $this->notifyAssignedMembers($subtask, $originalAssigneeIds, $request->user());
        $this->notifyStatusChange($subtask, $originalStatus, $validated['status'] ?? $originalStatus, $request->user());

        return back()->with('success', 'Subtarea actualizada correctamente.');
    }

    public function destroySubtask(Task $task, Task $subtask): RedirectResponse
    {
        $this->authorize('update', $task);
        $this->authorize('delete', $subtask);

        abort_unless($subtask->parent_id === $task->id, 404);

        $subtask->delete();

        return back()->with('success', 'Subtarea eliminada correctamente.');
    }

    public function move(Request $request, Task $task): RedirectResponse
    {
        $this->authorize('move', $task);

        $validated = $request->validate([
            'status' => ['required', Rule::in(['backlog', 'todo', 'in_progress', 'review', 'done', 'blocked'])],
            'position' => ['required', 'integer', 'min:0'],
        ]);
        $originalStatus = $task->status;

        DB::transaction(function () use ($request, $task, $validated) {
            $sourceStatus = $task->status;
            $targetStatus = $validated['status'];
            $position = $validated['position'];

            $orderedTasks = $this->visibleTasksForStatus($request->user(), $targetStatus, $task->id)
                ->values()
                ->all();

            $position = max(0, min($position, count($orderedTasks)));

            array_splice($orderedTasks, $position, 0, [$task]);

            foreach ($orderedTasks as $index => $orderedTask) {
                $orderedTask->update([
                    'status' => $targetStatus,
                    'position' => $index,
                    'completed_at' => $targetStatus === 'done' ? ($orderedTask->completed_at ?? now()) : null,
                ]);
            }

            if ($sourceStatus !== $targetStatus) {
                foreach ($this->visibleTasksForStatus($request->user(), $sourceStatus, $task->id) as $index => $orderedTask) {
                    $orderedTask->update(['position' => $index]);
                }
            }
        });

        $this->notifyStatusChange($task, $originalStatus, $validated['status'], $request->user());

        return back()->with('success', 'Tarea movida correctamente.');
    }

    public function storeComment(Request $request, Task $task): RedirectResponse
    {
        $this->authorize('comment', $task);

        $validated = $request->validate([
            'body' => ['required', 'string', 'max:3000'],
            'parent_id' => ['nullable', 'integer', 'exists:comments,id'],
        ]);

        if (! empty($validated['parent_id'])) {
            $parentComment = $task->comments()->whereKey($validated['parent_id'])->first();

            if (! $parentComment) {
                return back()->withErrors(['body' => 'Solo puedes responder comentarios de esta misma tarea.']);
            }
        }

        $comment = $task->comments()->create([
            'user_id' => $request->user()->id,
            'parent_id' => $validated['parent_id'] ?? null,
            'body' => $validated['body'],
        ]);

        $this->notifyCommentParticipants($task, $comment, $request->user());

        return back()->with('success', 'Comentario agregado.');
    }

    public function destroy(Task $task): RedirectResponse
    {
        $this->authorize('delete', $task);
        $task->delete();

        return back()->with('success', 'Tarea eliminada correctamente.');
    }

    public function storeAttachment(Request $request, Task $task): RedirectResponse
    {
        $this->authorize('update', $task);

        $validated = $request->validate([
            'files' => ['required', 'array', 'min:1'],
            'files.*' => ['file', 'mimes:jpg,jpeg,png,gif,webp,bmp,svg,pdf,txt,doc,docx', 'max:10240'],
        ]);

        foreach ($validated['files'] as $file) {
            $path = $file->store("tasks/{$task->id}", 'public');

            $task->attachments()->create([
                'uploaded_by' => $request->user()->id,
                'disk' => 'public',
                'path' => $path,
                'name' => $file->getClientOriginalName(),
                'mime_type' => $file->getClientMimeType(),
                'size' => $file->getSize(),
            ]);
        }

        return back()->with('success', 'Archivo adjunto cargado correctamente.');
    }

    public function destroyAttachment(Task $task, Attachment $attachment): RedirectResponse
    {
        $this->authorize('update', $task);

        abort_unless(
            $attachment->attachable_type === Task::class && $attachment->attachable_id === $task->id,
            404
        );

        Storage::disk($attachment->disk)->delete($attachment->path);
        $attachment->delete();

        return back()->with('success', 'Archivo adjunto eliminado correctamente.');
    }

    private function nextPosition(string $status): int
    {
        return (int) Task::query()->where('status', $status)->max('position') + 1;
    }

    private function nextChildPosition(Task $task): int
    {
        return (int) $task->children()->max('position') + 1;
    }

    private function visibleTasksForStatus(User $user, string $status, ?int $exceptTaskId = null): Collection
    {
        return Task::query()
            ->visibleForUser($user)
            ->where('status', $status)
            ->when($exceptTaskId, fn (Builder $query) => $query->whereKeyNot($exceptTaskId))
            ->orderBy('position')
            ->get();
    }

    private function serializeTask(Task $task): array
    {
        return [
            'id' => $task->id,
            'project_id' => $task->project_id,
            'parent_id' => $task->parent_id,
            'title' => $task->title,
            'description' => $task->description,
            'status' => $task->status,
            'priority' => $task->priority,
            'reporter_id' => $task->reporter_id,
            'due_date' => $task->due_date?->toDateString(),
            'completed_at' => $task->completed_at?->toISOString(),
            'position' => $task->position,
            'project' => $task->project ? [
                'id' => $task->project->id,
                'name' => $task->project->name,
                'color' => $task->project->color,
            ] : null,
            'assignee_ids' => $task->assignees->pluck('id')->values(),
            'assignees' => $task->assignees->map(fn (User $assignee) => [
                'id' => $assignee->id,
                'name' => $assignee->name,
            ])->values(),
            'reporter' => $task->reporter ? [
                'id' => $task->reporter->id,
                'name' => $task->reporter->name,
            ] : null,
            'comments' => $task->comments
                ->whereNull('parent_id')
                ->values()
                ->map(fn (Comment $comment) => $this->serializeComment($comment)),
            'attachments' => $task->attachments->map(fn (Attachment $attachment) => [
                'id' => $attachment->id,
                'name' => $attachment->name,
                'mime_type' => $attachment->mime_type,
                'size' => $attachment->size,
                'url' => Storage::disk($attachment->disk)->url($attachment->path),
                'uploaded_by' => $attachment->uploaded_by,
                'uploaded_by_name' => $attachment->uploader?->name,
                'created_at' => $attachment->created_at?->toISOString(),
            ])->values(),
            'children' => $task->children->map(fn (Task $child) => [
                'id' => $child->id,
                'title' => $child->title,
                'status' => $child->status,
                'assignee_ids' => $child->assignees->pluck('id')->values(),
                'assignees' => $child->assignees->map(fn (User $assignee) => [
                    'id' => $assignee->id,
                    'name' => $assignee->name,
                ])->values(),
                'completed_at' => $child->completed_at?->toISOString(),
                'position' => $child->position,
            ])->values(),
        ];
    }

    private function syncTaskAssignees(Task $task, array $assigneeIds): void
    {
        $normalized = collect($assigneeIds)
            ->filter(fn ($id) => filled($id))
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values()
            ->all();

        $task->assignees()->sync($normalized);
    }

    private function notifyAssignedMembers(Task $task, array $previousAssigneeIds, User $actor): void
    {
        $task->loadMissing(['project:id,name', 'assignees']);

        $newAssigneeIds = $task->assignees
            ->pluck('id')
            ->map(fn ($id) => (int) $id)
            ->diff(collect($previousAssigneeIds)->map(fn ($id) => (int) $id))
            ->values();

        if ($newAssigneeIds->isEmpty()) {
            return;
        }

        $task->assignees
            ->whereIn('id', $newAssigneeIds)
            ->each(fn (User $assignee) => $assignee->notify(new TaskAssignedNotification($task, $actor)));
    }

    private function notifyStatusChange(Task $task, string $fromStatus, string $toStatus, User $actor): void
    {
        if ($fromStatus === $toStatus) {
            return;
        }

        $task->refresh()->loadMissing(['project:id,name', 'assignees']);

        $task->assignees->each(fn (User $assignee) => $assignee->notify(
            new TaskStatusChangedNotification($task, $actor, $fromStatus, $toStatus)
        ));
    }

    private function notifyCommentParticipants(Task $task, Comment $comment, User $actor): void
    {
        $task->loadMissing([
            'project.owner:id,name,email',
            'project.members:id,name,email',
            'assignees:id,name,email',
        ]);

        $recipients = collect()
            ->push($task->project?->owner)
            ->merge($task->project?->members ?? collect())
            ->merge($task->assignees)
            ->filter()
            ->unique('id')
            ->reject(fn (User $user) => $user->id === $actor->id)
            ->values();

        if ($recipients->isEmpty()) {
            return;
        }

        $recipients->each(fn (User $recipient) => $recipient->notify(
            new TaskCommentNotification($task, $comment, $actor)
        ));
    }

    private function serializeComment(Comment $comment): array
    {
        return [
            'id' => $comment->id,
            'parent_id' => $comment->parent_id,
            'body' => $comment->body,
            'created_at' => $comment->created_at?->toISOString(),
            'user' => $comment->user ? [
                'id' => $comment->user->id,
                'name' => $comment->user->name,
            ] : null,
            'replies' => $comment->replies
                ->values()
                ->map(fn (Comment $reply) => $this->serializeComment($reply)),
        ];
    }
}
