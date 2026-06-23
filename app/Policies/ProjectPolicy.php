<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;

class ProjectPolicy
{
    private function canManage(User $user): bool
    {
        return $user->hasAnyRole(['super_admin', 'admin', 'project_manager']);
    }

    public function viewAny(User $user): bool
    {
        return $user->can('projects.view');
    }

    public function view(User $user, Project $project): bool
    {
        return $user->can('projects.view') && Project::query()->visibleForUser($user)->whereKey($project)->exists();
    }

    public function create(User $user): bool
    {
        return $this->canManage($user) && $user->can('projects.create');
    }

    public function update(User $user, Project $project): bool
    {
        return $this->canManage($user)
            && $user->can('projects.update')
            && $this->view($user, $project);
    }

    public function delete(User $user, Project $project): bool
    {
        return $this->canManage($user)
            && $user->can('projects.delete')
            && $this->view($user, $project);
    }
}
