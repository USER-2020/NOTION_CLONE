<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\Project;
use App\Models\Task;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $currentWorkspace = Workspace::currentForUser($user, $request->session()->get('current_workspace_id'));

        $visibleProjects = Project::query()->visibleForUser($user);
        $visibleTasks = Task::query()->visibleForUser($user);

        if ($currentWorkspace) {
            $visibleProjects->where('workspace_id', $currentWorkspace->id);
            $visibleTasks->whereHas('project', fn ($query) => $query->where('workspace_id', $currentWorkspace->id));
        }

        return Inertia::render('Dashboard', [
            'stats' => [
                'projectsAssigned' => (clone $visibleProjects)->count(),
                'tasksPending' => (clone $visibleTasks)->whereNotIn('status', ['done'])->count(),
                'tasksOverdue' => (clone $visibleTasks)->whereDate('due_date', '<', now())->whereNull('completed_at')->count(),
                'tasksCompletedThisWeek' => (clone $visibleTasks)->whereBetween('completed_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
            ],
            'tasksToday' => (clone $visibleTasks)
                ->with(['project:id,name,color'])
                ->whereDate('due_date', now())
                ->orderBy('priority')
                ->limit(6)
                ->get(),
            'favoriteProjects' => (clone $visibleProjects)
                ->withCount(['tasks', 'pages'])
                ->where('is_favorite', true)
                ->limit(4)
                ->get(),
            'projectProgress' => (clone $visibleProjects)
                ->withCount([
                    'tasks',
                    'tasks as completed_tasks_count' => fn ($query) => $query->whereNotNull('completed_at'),
                ])
                ->limit(6)
                ->get()
                ->map(fn (Project $project) => [
                    'id' => $project->id,
                    'name' => $project->name,
                    'color' => $project->color,
                    'progress' => $project->tasks_count > 0
                        ? (int) round(($project->completed_tasks_count / $project->tasks_count) * 100)
                        : 0,
                ]),
            'recentActivity' => Activity::query()
                ->whereBelongsTo($user, 'user')
                ->latest()
                ->limit(8)
                ->get(),
        ]);
    }
}
