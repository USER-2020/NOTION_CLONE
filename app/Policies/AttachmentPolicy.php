<?php

namespace App\Policies;

use App\Models\Attachment;
use App\Models\Page;
use App\Models\Task;
use App\Models\User;

class AttachmentPolicy
{
    public function view(User $user, Attachment $attachment): bool
    {
        if ($attachment->attachable_type === Task::class) {
            return Task::query()->visibleForUser($user)->whereKey($attachment->attachable_id)->exists();
        }

        if ($attachment->attachable_type === Page::class) {
            return Page::query()->visibleForUser($user)->whereKey($attachment->attachable_id)->exists();
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->can('files.manage');
    }

    public function delete(User $user, Attachment $attachment): bool
    {
        return $user->can('files.manage') && $this->view($user, $attachment);
    }
}
