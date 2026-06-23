<?php

namespace App\Http\Requests;

use App\Models\Project;
use App\Models\Task;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'project_id' => ['required', 'integer', 'exists:projects,id'],
            'parent_id' => ['nullable', 'integer', 'exists:tasks,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['required', Rule::in(['backlog', 'todo', 'in_progress', 'review', 'done', 'blocked'])],
            'priority' => ['required', Rule::in(['low', 'medium', 'high', 'urgent'])],
            'assignee_ids' => ['nullable', 'array'],
            'assignee_ids.*' => ['integer', 'exists:users,id'],
            'start_date' => ['nullable', 'date'],
            'due_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'position' => ['nullable', 'integer', 'min:0'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $project = Project::with('members')->find($this->integer('project_id'));

            if (! $project || ! Project::query()->visibleForUser($this->user())->whereKey($project)->exists()) {
                $validator->errors()->add('project_id', 'You do not have access to that project.');
                return;
            }

            $memberIds = $project->members->pluck('id')->push($project->owner_id)->unique();
            foreach ((array) $this->input('assignee_ids', []) as $assigneeId) {
                if (! $memberIds->contains((int) $assigneeId)) {
                    $validator->errors()->add('assignee_ids', 'Todos los responsables deben pertenecer al proyecto.');
                    break;
                }
            }

            $parentId = $this->integer('parent_id');
            if ($parentId) {
                $parentTask = Task::query()->find($parentId);

                if (! $parentTask || $parentTask->project_id !== $project->id) {
                    $validator->errors()->add('parent_id', 'The selected parent task must belong to the same project.');
                }
            }
        });
    }
}
