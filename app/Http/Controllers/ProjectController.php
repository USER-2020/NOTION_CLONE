<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Models\Project;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Project::class);
        $currentWorkspace = Workspace::currentForUser($request->user(), $request->session()->get('current_workspace_id'));

        return Inertia::render('Projects/Index', [
            'projects' => Project::query()
                ->visibleForUser($request->user())
                ->when($currentWorkspace, fn ($query) => $query->where('workspace_id', $currentWorkspace->id))
                ->with([
                    'workspace:id,name,logo_path',
                    'owner:id,name',
                    'members' => fn ($query) => $query->select('users.id', 'name')->orderBy('name'),
                    'tasks' => fn ($query) => $query
                        ->select('id', 'project_id', 'title', 'status', 'priority', 'position')
                        ->orderBy('position')
                        ->orderBy('id'),
                ])
                ->withCount(['tasks', 'pages'])
                ->latest()
                ->get()
                ->map(fn (Project $project) => [
                    'id' => $project->id,
                    'name' => $project->name,
                    'description' => $project->description,
                    'logo_url' => $project->logo_path ? Storage::disk('public')->url($project->logo_path) : null,
                    'color' => $project->color,
                    'status' => $project->status,
                    'workspace' => $project->workspace,
                    'owner' => $project->owner,
                    'priority' => $project->priority,
                    'tasks_count' => $project->tasks_count,
                    'pages_count' => $project->pages_count,
                    'manager_count' => $project->members->where('pivot.role', 'project_manager')->count(),
                    'member_count' => $project->members->where('pivot.role', 'member')->count(),
                    'top_tasks' => $project->tasks
                        ->take(3)
                        ->map(fn ($task) => [
                            'id' => $task->id,
                            'title' => $task->title,
                            'status' => $task->status,
                            'priority' => $task->priority,
                        ])
                        ->values(),
                ]),
            'workspaces' => Workspace::query()
                ->visibleForUser($request->user())
                ->get(['id', 'name']),
        ]);
    }

    public function store(StoreProjectRequest $request): RedirectResponse
    {
        $workspace = Workspace::query()->visibleForUser($request->user())->findOrFail($request->integer('workspace_id'));
        $this->authorize('create', Project::class);

        $project = Project::create([
            ...collect($request->validated())->except(['manager_ids', 'member_ids', 'logo', 'remove_logo'])->all(),
            'workspace_id' => $workspace->id,
            'slug' => $this->uniqueSlug($workspace->id, $request->string('name')->toString()),
            'owner_id' => $request->user()->id,
            'status' => $request->input('status', 'planning'),
            'priority' => $request->input('priority', 'medium'),
            'icon' => $request->input('icon', 'folder'),
            'color' => $request->input('color', '#1f7a8c'),
        ]);

        if ($request->hasFile('logo')) {
            $project->update([
                'logo_path' => $request->file('logo')->store("projects/{$project->id}/logo", 'public'),
            ]);
        }

        return to_route('projects.show', $project)->with('success', 'Proyecto creado correctamente.');
    }

    public function show(Request $request, Project $project): Response
    {
        $this->authorize('view', $project);

        $project->load([
            'workspace:id,name,logo_path',
            'owner:id,name',
            'members' => fn ($query) => $query->select('users.id', 'name')->orderBy('name'),
            'pages' => fn ($query) => $query
                ->select('id', 'workspace_id', 'project_id', 'parent_id', 'title', 'slug', 'excerpt', 'is_favorite', 'updated_at')
                ->orderByDesc('is_favorite')
                ->orderByDesc('updated_at')
                ->orderBy('title'),
            'tasks' => fn ($query) => $query->with(['assignees:id,name'])->orderBy('position'),
        ]);

        return Inertia::render('Projects/Show', [
            'project' => [
                'id' => $project->id,
                'workspace_id' => $project->workspace_id,
                'workspace' => $project->workspace ? [
                    'id' => $project->workspace->id,
                    'name' => $project->workspace->name,
                    'logo_url' => $project->workspace->logo_path ? Storage::disk('public')->url($project->workspace->logo_path) : null,
                ] : null,
                'owner_id' => $project->owner_id,
                'owner' => $project->owner,
                'name' => $project->name,
                'slug' => $project->slug,
                'description' => $project->description,
                'logo_url' => $project->logo_path ? Storage::disk('public')->url($project->logo_path) : null,
                'status' => $project->status,
                'priority' => $project->priority,
                'start_date' => $project->start_date?->toDateString(),
                'due_date' => $project->due_date?->toDateString(),
                'icon' => $project->icon,
                'color' => $project->color,
                'managers' => $this->serializeMembersByRole($project, 'project_manager'),
                'members' => $this->serializeMembersByRole($project, 'member'),
                'manager_ids' => $project->members
                    ->where('pivot.role', 'project_manager')
                    ->pluck('id')
                    ->values(),
                'member_ids' => $project->members
                    ->where('pivot.role', 'member')
                    ->pluck('id')
                    ->values(),
                'pages' => $project->pages,
                'tasks' => $project->tasks,
            ],
            'workspaces' => Workspace::query()
                ->visibleForUser($request->user())
                ->get(['id', 'name']),
            'managerOptions' => $this->projectManagersForSelection($request->user()),
            'memberOptions' => $this->projectMembersForSelection($request->user()),
        ]);
    }

    public function update(UpdateProjectRequest $request, Project $project): RedirectResponse
    {
        $this->authorize('update', $project);
        $workspace = Workspace::query()->visibleForUser($request->user())->findOrFail($request->integer('workspace_id'));

        $project->update([
            ...collect($request->validated())->except(['manager_ids', 'member_ids', 'logo', 'remove_logo'])->all(),
            'workspace_id' => $workspace->id,
            'slug' => $this->uniqueSlug($workspace->id, $request->string('name')->toString(), $project->id),
        ]);

        if ($request->boolean('remove_logo') && $project->logo_path) {
            Storage::disk('public')->delete($project->logo_path);
            $project->update(['logo_path' => null]);
        }

        if ($request->hasFile('logo')) {
            if ($project->logo_path) {
                Storage::disk('public')->delete($project->logo_path);
            }

            $project->update([
                'logo_path' => $request->file('logo')->store("projects/{$project->id}/logo", 'public'),
            ]);
        }

        $this->syncProjectParticipants(
            $project,
            $request->input('manager_ids', []),
            $request->input('member_ids', []),
            $request->user()
        );

        return to_route('projects.show', $project)->with('success', 'Proyecto actualizado correctamente.');
    }

    public function destroy(Project $project): RedirectResponse
    {
        $this->authorize('delete', $project);

        if ($project->logo_path) {
            Storage::disk('public')->delete($project->logo_path);
        }

        $project->delete();

        return to_route('projects.index')->with('success', 'Proyecto eliminado correctamente.');
    }

    private function syncProjectParticipants(Project $project, array $managerIds = [], array $memberIds = [], ?User $actor = null): void
    {
        $actor ??= $project->owner;

        $allowedManagerIds = $this->projectManagersForSelection($actor)->pluck('id');
        $allowedMemberIds = $this->projectMembersForSelection($actor)->pluck('id');

        $normalizedManagers = collect($managerIds)
            ->map(fn ($id) => (int) $id)
            ->filter(fn ($id) => $id > 0)
            ->unique()
            ->filter(fn ($id) => $allowedManagerIds->contains($id))
            ->values();

        $normalizedMembers = collect($memberIds)
            ->map(fn ($id) => (int) $id)
            ->filter(fn ($id) => $id > 0)
            ->reject(fn ($id) => $normalizedManagers->contains($id))
            ->unique()
            ->filter(fn ($id) => $allowedMemberIds->contains($id))
            ->values();

        $payload = $normalizedManagers
            ->mapWithKeys(fn ($id) => [$id => ['role' => 'project_manager']])
            ->union($normalizedMembers->mapWithKeys(fn ($id) => [$id => ['role' => 'member']]))
            ->all();

        $project->members()->sync($payload);
    }

    private function serializeMembersByRole(Project $project, string $role): Collection
    {
        return $project->members
            ->where('pivot.role', $role)
            ->values()
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
            ]);
    }

    private function projectManagersForSelection(User $actor): Collection
    {
        return User::query()
            ->active()
            ->selectableBy($actor)
            ->whereHas('roles', fn ($query) => $query->where('name', 'project_manager'))
            ->orderBy('name')
            ->get(['id', 'name']);
    }

    private function projectMembersForSelection(User $actor): Collection
    {
        return User::query()
            ->active()
            ->selectableBy($actor)
            ->whereHas('roles', fn ($query) => $query->where('name', 'member'))
            ->orderBy('name')
            ->get(['id', 'name']);
    }

    private function uniqueSlug(int $workspaceId, string $name, ?int $ignoreProjectId = null): string
    {
        $baseSlug = Str::slug($name);
        $slug = $baseSlug !== '' ? $baseSlug : 'proyecto';
        $originalSlug = $slug;
        $suffix = 2;

        while (
            Project::query()
                ->where('workspace_id', $workspaceId)
                ->where('slug', $slug)
                ->when($ignoreProjectId, fn ($query) => $query->whereKeyNot($ignoreProjectId))
                ->exists()
        ) {
            $slug = "{$originalSlug}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }
}
