<?php

namespace App\Http\Requests;

use App\Models\Page;
use App\Models\Project;
use App\Models\Workspace;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StorePageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'workspace_id' => ['required', 'integer', 'exists:workspaces,id'],
            'project_id' => ['nullable', 'integer', 'exists:projects,id'],
            'parent_id' => ['nullable', 'integer', 'exists:pages,id'],
            'title' => ['required', 'string', 'max:255'],
            'excerpt' => ['nullable', 'string'],
            'body' => ['nullable', 'string'],
            'is_favorite' => ['nullable', 'boolean'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $workspace = Workspace::query()->visibleForUser($this->user())->find($this->integer('workspace_id'));

            if (! $workspace) {
                $validator->errors()->add('workspace_id', 'No tienes acceso a ese espacio de trabajo.');
            }

            if ($this->filled('project_id')) {
                $project = Project::query()->visibleForUser($this->user())->find($this->integer('project_id'));

                if (! $project) {
                    $validator->errors()->add('project_id', 'La página debe pertenecer a un proyecto visible para ti.');
                } elseif ($workspace && $project->workspace_id !== $workspace->id) {
                    $validator->errors()->add('project_id', 'El proyecto seleccionado no pertenece al espacio de trabajo elegido.');
                }
            }

            if ($this->filled('parent_id')) {
                $parent = Page::query()->visibleForUser($this->user())->find($this->integer('parent_id'));

                if (! $parent) {
                    $validator->errors()->add('parent_id', 'La página padre no está disponible para ti.');
                } elseif ($workspace && $parent->workspace_id !== $workspace->id) {
                    $validator->errors()->add('parent_id', 'La página padre debe pertenecer al mismo espacio de trabajo.');
                } elseif ($this->filled('project_id') && $parent->project_id !== $this->integer('project_id')) {
                    $validator->errors()->add('parent_id', 'La página padre debe pertenecer al mismo proyecto.');
                } elseif (! $this->filled('project_id') && $parent->project_id !== null) {
                    $validator->errors()->add('parent_id', 'Para usar esa página padre debes seleccionar su proyecto.');
                }
            }
        });
    }
}
