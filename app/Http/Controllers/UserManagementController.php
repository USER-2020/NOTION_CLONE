<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Workspace;
use App\Notifications\MemberWelcomeNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class UserManagementController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()->can('users.manage'), 403);
        $canManageSuperAdmins = $request->user()->hasRole('super_admin');

        return Inertia::render('Users/Index', [
            'users' => User::query()
                ->with(['roles:name', 'workspaces:id,name'])
                ->withCount(['ownedWorkspaces', 'ownedProjects'])
                ->latest()
                ->get()
                ->map(fn (User $user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'status' => $user->status,
                    'theme_preference' => $user->theme_preference,
                    'roles' => $user->getRoleNames()->values(),
                    'primary_role' => $user->getRoleNames()->first(),
                    'workspaces' => $user->workspaces->map(fn (Workspace $workspace) => [
                        'id' => $workspace->id,
                        'name' => $workspace->name,
                    ])->values(),
                    'workspace_ids' => $user->workspaces->pluck('id')->values(),
                    'can_edit' => $canManageSuperAdmins || ! $user->hasRole('super_admin'),
                    'can_deactivate' => $this->canManageStatus($request->user(), $user) && $user->status === 'active',
                    'created_at' => $user->created_at?->toDateString(),
                ])
                ->values(),
            'workspaces' => Workspace::query()
                ->visibleForUser($request->user())
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn (Workspace $workspace) => [
                    'id' => $workspace->id,
                    'name' => $workspace->name,
                ])
                ->values(),
            'roleOptions' => [
                ...($canManageSuperAdmins ? [['value' => 'super_admin', 'label' => 'Super Admin']] : []),
                ['value' => 'admin', 'label' => 'Administrador'],
                ['value' => 'project_manager', 'label' => 'Gestor de proyectos'],
                ['value' => 'member', 'label' => 'Miembro'],
                ['value' => 'viewer', 'label' => 'Visualizador'],
            ],
            'statusOptions' => [
                ['value' => 'active', 'label' => 'Activo'],
                ['value' => 'inactive', 'label' => 'Inactivo'],
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        abort_unless($request->user()->can('users.manage'), 403);

        $workspaceIds = $this->validatedWorkspaceIds($request);
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::defaults()],
            'role' => ['required', Rule::in(['admin', 'project_manager', 'member', 'viewer'])],
            'status' => ['required', Rule::in(['active', 'inactive'])],
        ]);

        $workspaces = Workspace::query()
            ->visibleForUser($request->user())
            ->whereIn('id', $workspaceIds)
            ->get();

        abort_unless($workspaces->count() === $workspaceIds->count(), 403);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'status' => $validated['status'],
            'theme_preference' => 'system',
        ]);

        $user->assignRole($validated['role']);

        foreach ($workspaces as $workspace) {
            $workspace->users()->syncWithoutDetaching([
                $user->id => [
                    'role' => $validated['role'],
                    'joined_at' => now(),
                ],
            ]);
        }

        $user->notify(new MemberWelcomeNotification(
            workspace: $workspaces->first(),
            password: $validated['password'],
            role: $validated['role'],
            createdBy: $request->user(),
        ));

        return to_route('users.index')->with('success', 'Miembro creado correctamente.');
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        abort_unless($request->user()->can('users.manage'), 403);
        abort_unless($request->user()->hasRole('super_admin') || ! $user->hasRole('super_admin'), 403);

        $workspaceIds = $this->validatedWorkspaceIds($request);
        $allowedRoles = ['admin', 'project_manager', 'member', 'viewer'];

        if ($request->user()->hasRole('super_admin')) {
            array_unshift($allowedRoles, 'super_admin');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => ['nullable', 'confirmed', Password::defaults()],
            'role' => ['required', Rule::in($allowedRoles)],
            'status' => ['required', Rule::in(['active', 'inactive'])],
        ]);

        $workspaces = Workspace::query()
            ->visibleForUser($request->user())
            ->whereIn('id', $workspaceIds)
            ->get();

        abort_unless($workspaces->count() === $workspaceIds->count(), 403);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'status' => $validated['status'],
            ...($validated['password'] ? ['password' => $validated['password']] : []),
        ]);

        $user->syncRoles([$validated['role']]);

        $syncPayload = $workspaces
            ->mapWithKeys(fn (Workspace $workspace) => [
                $workspace->id => [
                    'role' => $validated['role'],
                    'joined_at' => $workspace->users()->whereKey($user->id)->first()?->pivot?->joined_at ?? now(),
                ],
            ])
            ->all();

        $user->workspaces()->sync($syncPayload);

        return to_route('users.index')->with('success', 'Miembro actualizado correctamente.');
    }

    public function deactivate(Request $request, User $user): RedirectResponse
    {
        abort_unless($request->user()->can('users.manage'), 403);
        abort_unless($this->canManageStatus($request->user(), $user), 403);

        if ($user->status === 'inactive') {
            return to_route('users.index')->with('success', 'El miembro ya estaba desactivado.');
        }

        $user->update(['status' => 'inactive']);

        return to_route('users.index')->with('success', 'Miembro desactivado correctamente.');
    }

    private function validatedWorkspaceIds(Request $request): Collection
    {
        $request->validate([
            'workspace_ids' => ['nullable', 'array', 'min:1'],
            'workspace_ids.*' => ['integer', 'exists:workspaces,id'],
            'workspace_id' => ['nullable', 'integer', 'exists:workspaces,id'],
        ]);

        return collect($request->input('workspace_ids', []))
            ->when(
                blank($request->input('workspace_ids')) && filled($request->input('workspace_id')),
                fn (Collection $ids) => $ids->push((int) $request->input('workspace_id'))
            )
            ->filter(fn ($id) => filled($id))
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values()
            ->tap(function (Collection $ids) {
                if ($ids->isEmpty()) {
                    throw ValidationException::withMessages([
                        'workspace_ids' => 'Selecciona al menos un espacio de trabajo.',
                    ]);
                }
            });
    }

    private function canManageStatus(User $actor, User $subject): bool
    {
        if ($actor->is($subject)) {
            return false;
        }

        if ($subject->hasRole('super_admin') && ! $actor->hasRole('super_admin')) {
            return false;
        }

        return true;
    }

}
