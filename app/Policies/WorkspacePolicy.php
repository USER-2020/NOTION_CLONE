<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Workspace;

class WorkspacePolicy
{
    private function canManage(User $user): bool
    {
        return $user->hasAnyRole(['super_admin', 'admin', 'project_manager']);
    }

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
        return $this->canManage($user) && $user->can('workspaces.create');
    }

    public function update(User $user, Workspace $workspace): bool
    {
        return $this->canManage($user)
            && $user->can('workspaces.update')
            && $this->view($user, $workspace);
    }

    public function delete(User $user, Workspace $workspace): bool
    {
        return $this->canManage($user)
            && $user->can('workspaces.delete')
            && $this->view($user, $workspace);
    }
}
