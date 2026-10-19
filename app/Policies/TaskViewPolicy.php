<?php

namespace App\Policies;

use App\Models\TaskView;
use App\Models\User;

class TaskViewPolicy
{
    public function update(User $user, TaskView $taskView): bool
    {
        return $taskView->user_id === $user->id;
    }

    public function delete(User $user, TaskView $taskView): bool
    {
        return $this->update($user, $taskView);
    }
}
