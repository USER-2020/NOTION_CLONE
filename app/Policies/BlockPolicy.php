<?php

namespace App\Policies;

use App\Models\Block;
use App\Models\Page;
use App\Models\User;

class BlockPolicy
{
    public function view(User $user, Block $block): bool
    {
        return Page::query()->visibleForUser($user)->whereKey($block->page_id)->exists();
    }

    public function create(User $user): bool
    {
        return $user->can('pages.edit');
    }

    public function update(User $user, Block $block): bool
    {
        return $user->can('pages.edit') && $this->view($user, $block);
    }

    public function delete(User $user, Block $block): bool
    {
        return $user->can('pages.edit') && $this->view($user, $block);
    }
}
