<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class WorkspaceController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Workspace::class);

        return Inertia::render('Workspaces/Index', [
            'workspaces' => Workspace::query()
                ->visibleForUser($request->user())
                ->with(['owner:id,name', 'users:id,name'])
                ->withCount(['projects', 'pages', 'users'])
                ->orderBy('name')
                ->get()
                ->map(fn (Workspace $workspace) => [
                    'id' => $workspace->id,
                    'name' => $workspace->name,
                    'slug' => $workspace->slug,
                    'description' => $workspace->description,
                    'owner_id' => $workspace->owner_id,
                    'owner' => $workspace->owner ? [
                        'id' => $workspace->owner->id,
                        'name' => $workspace->owner->name,
                    ] : null,
                    'projects_count' => $workspace->projects_count,
                    'pages_count' => $workspace->pages_count,
                    'users_count' => $workspace->users_count,
                ])
                ->values(),
            'owners' => User::query()
                ->active()
                ->selectableBy($request->user())
                ->orderBy('name')
                ->get(['id', 'name', 'email'])
                ->map(fn (User $user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ])
                ->values(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', Workspace::class);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'owner_id' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        $ownerId = $validated['owner_id'] ?? $request->user()->id;
        User::query()->selectableBy($request->user())->findOrFail($ownerId);

        $workspace = Workspace::create([
            'name' => $validated['name'],
            'slug' => $this->uniqueSlug($validated['name']),
            'description' => $validated['description'] ?? null,
            'owner_id' => $ownerId,
            'settings' => ['theme' => 'obsidian-sand'],
        ]);

        $members = [
            $ownerId => ['role' => 'owner', 'joined_at' => now()],
        ];

        if ($request->user()->id !== $ownerId) {
            $members[$request->user()->id] = ['role' => 'admin', 'joined_at' => now()];
        }

        $workspace->users()->syncWithoutDetaching($members);
        $request->session()->put('current_workspace_id', $workspace->id);

        return to_route('workspaces.index')->with('success', 'Espacio de trabajo creado correctamente.');
    }

    public function update(Request $request, Workspace $workspace): RedirectResponse
    {
        $this->authorize('update', $workspace);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'owner_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        User::query()->selectableBy($request->user())->findOrFail($validated['owner_id']);

        $workspace->update([
            'name' => $validated['name'],
            'slug' => $workspace->name === $validated['name']
                ? $workspace->slug
                : $this->uniqueSlug($validated['name'], $workspace->id),
            'description' => $validated['description'] ?? null,
            'owner_id' => $validated['owner_id'],
        ]);

        $workspace->users()->syncWithoutDetaching([
            $validated['owner_id'] => ['role' => 'owner', 'joined_at' => now()],
        ]);

        return to_route('workspaces.index')->with('success', 'Espacio de trabajo actualizado.');
    }

    public function switch(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'workspace_id' => ['required', 'integer', 'exists:workspaces,id'],
        ]);

        $workspace = Workspace::query()
            ->visibleForUser($request->user())
            ->findOrFail($validated['workspace_id']);

        $request->session()->put('current_workspace_id', $workspace->id);

        return back()->with('success', 'Espacio de trabajo cambiado.');
    }

    private function uniqueSlug(string $name, ?int $ignoreWorkspaceId = null): string
    {
        $baseSlug = Str::slug($name);
        $slug = $baseSlug;
        $suffix = 2;

        while (Workspace::query()
            ->when($ignoreWorkspaceId, fn ($query) => $query->whereKeyNot($ignoreWorkspaceId))
            ->where('slug', $slug)
            ->exists()) {
            $slug = "{$baseSlug}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }
}
