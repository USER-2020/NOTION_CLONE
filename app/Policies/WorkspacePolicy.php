<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Workspace;

class WorkspacePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('workspaces.view');
    }

    public function view(User $user, Workspace $workspace): bool
    {
        return $user->can('workspaces.view') && Workspace::query()->visibleForUser($user)->whereKey($workspace)->exists();
    }

    public function create(User $user): bool
    {
        return $user->can('workspaces.create');
    }

    public function update(User $user, Workspace $workspace): bool
    {
        return $user->can('workspaces.update') && $this->view($user, $workspace);
    }
}
