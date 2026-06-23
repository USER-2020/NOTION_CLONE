<?php

namespace App\Http\Middleware;

use App\Models\Workspace;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): string|null
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $availableWorkspaces = collect();
        $currentWorkspace = null;

        if ($request->user()) {
            $availableWorkspaces = Workspace::optionsForUser($request->user());
            $currentWorkspace = Workspace::currentForUser(
                $request->user(),
                $request->session()->get('current_workspace_id')
            );

            if ($currentWorkspace && $request->session()->get('current_workspace_id') !== $currentWorkspace->id) {
                $request->session()->put('current_workspace_id', $currentWorkspace->id);
            }
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
                'permissions' => $request->user()?->getAllPermissions()->pluck('name') ?? [],
                'roles' => $request->user()?->getRoleNames()->values() ?? [],
            ],
            'workspace' => [
                'current' => $currentWorkspace ? [
                    'id' => $currentWorkspace->id,
                    'name' => $currentWorkspace->name,
                    'slug' => $currentWorkspace->slug,
                    'logo_url' => $currentWorkspace->logo_path ? Storage::disk('public')->url($currentWorkspace->logo_path) : null,
                ] : null,
                'available' => $availableWorkspaces->map(fn (Workspace $workspace) => [
                    'id' => $workspace->id,
                    'name' => $workspace->name,
                    'slug' => $workspace->slug,
                    'logo_url' => $workspace->logo_path ? Storage::disk('public')->url($workspace->logo_path) : null,
                ])->values(),
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
