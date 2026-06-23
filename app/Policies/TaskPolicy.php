<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;

class TaskPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('tasks.view');
    }

    public function view(User $user, Task $task): bool
    {
        return $user->can('tasks.view') && Task::query()->visibleForUser($user)->whereKey($task)->exists();
    }

    public function create(User $user): bool
    {
        return $user->can('tasks.manage') && ! $user->hasRole('member');
    }

    public function update(User $user, Task $task): bool
    {
        return $user->can('tasks.manage') && ! $user->hasRole('member') && $this->view($user, $task);
    }

    public function delete(User $user, Task $task): bool
    {
        return $user->can('tasks.manage') && ! $user->hasRole('member') && $this->view($user, $task);
    }

    public function move(User $user, Task $task): bool
    {
        return $this->view($user, $task) && ($user->can('tasks.manage') || $user->hasRole('member'));
    }

    public function comment(User $user, Task $task): bool
    {
        return $this->view($user, $task) && $user->can('comments.create');
    }
}
