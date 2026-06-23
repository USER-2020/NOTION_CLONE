<?php

namespace App\Providers;

use App\Models\Attachment;
use App\Models\Block;
use App\Models\Page;
use App\Models\Project;
use App\Models\Task;
use App\Models\Workspace;
use App\Policies\AttachmentPolicy;
use App\Policies\BlockPolicy;
use App\Policies\PagePolicy;
use App\Policies\ProjectPolicy;
use App\Policies\TaskPolicy;
use App\Policies\WorkspacePolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Attachment::class => AttachmentPolicy::class,
        Block::class => BlockPolicy::class,
        Page::class => PagePolicy::class,
        Project::class => ProjectPolicy::class,
        Task::class => TaskPolicy::class,
        Workspace::class => WorkspacePolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();

        Gate::before(function ($user, string $ability) {
            return $user->hasRole('super_admin') ? true : null;
        });
    }
}
