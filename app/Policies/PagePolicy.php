<?php

namespace App\Policies;

use App\Models\Page;
use App\Models\User;

class PagePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('pages.view');
    }

    public function view(User $user, Page $page): bool
    {
        return $user->can('pages.view') && Page::query()->visibleForUser($user)->whereKey($page)->exists();
    }

    public function create(User $user): bool
    {
        return $user->can('pages.edit');
    }

    public function update(User $user, Page $page): bool
    {
        return $user->can('pages.edit') && $this->view($user, $page);
    }

    public function delete(User $user, Page $page): bool
    {
        return $user->can('pages.edit') && $this->view($user, $page);
    }
}
