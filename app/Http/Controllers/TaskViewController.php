<?php

namespace App\Http\Controllers;

use App\Models\TaskView;
use App\Models\Workspace;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TaskViewController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $workspace = $this->currentWorkspace($request);

        abort_unless($workspace, 404);

        $validated = $this->validatedPayload($request);

        TaskView::create([
            'workspace_id' => $workspace->id,
            'user_id' => $request->user()->id,
            ...$validated,
        ]);

        return back()->with('success', 'Vista guardada correctamente.');
    }

    public function update(Request $request, TaskView $taskView): RedirectResponse
    {
        $this->authorize('update', $taskView);
        $this->assertBelongsToCurrentWorkspace($request, $taskView);

        $taskView->update($this->validatedPayload($request, $taskView));

        return back()->with('success', 'Vista actualizada correctamente.');
    }

    public function destroy(Request $request, TaskView $taskView): RedirectResponse
    {
        $this->authorize('delete', $taskView);
        $this->assertBelongsToCurrentWorkspace($request, $taskView);

        $taskView->delete();

        return back()->with('success', 'Vista eliminada correctamente.');
    }

    private function validatedPayload(Request $request, ?TaskView $taskView = null): array
    {
        $workspace = $this->currentWorkspace($request);

        return $request->validate([
            'name' => [
                'required',
                'string',
                'max:80',
                Rule::unique('task_views', 'name')
                    ->where(fn ($query) => $query
                        ->where('workspace_id', $workspace?->id)
                        ->where('user_id', $request->user()->id))
                    ->ignore($taskView?->id),
            ],
            'view_type' => ['required', Rule::in(['scrum', 'timeline', 'calendar'])],
            'filters' => ['nullable', 'array'],
            'filters.priority' => ['nullable', Rule::in(['all', 'low', 'medium', 'high', 'urgent'])],
            'filters.status' => ['nullable', Rule::in(['all', 'backlog', 'todo', 'in_progress', 'review', 'done', 'blocked'])],
            'sorts' => ['nullable', 'array'],
        ]);
    }

    private function currentWorkspace(Request $request): ?Workspace
    {
        return Workspace::currentForUser($request->user(), $request->session()->get('current_workspace_id'));
    }

    private function assertBelongsToCurrentWorkspace(Request $request, TaskView $taskView): void
    {
        abort_unless($this->currentWorkspace($request)?->id === $taskView->workspace_id, 404);
    }
}
