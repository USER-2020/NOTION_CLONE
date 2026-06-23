<?php

namespace Database\Seeders;

use App\Models\Block;
use App\Models\Page;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use App\Models\Workspace;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(RolesAndPermissionsSeeder::class);

        $superAdmin = User::factory()->create([
            'name' => 'Super Admin',
            'email' => 'admin@notion-clone.test',
            'status' => 'active',
        ]);
        $superAdmin->assignRole('super_admin');

        $manager = User::factory()->create([
            'name' => 'Project Manager',
            'email' => 'manager@notion-clone.test',
            'status' => 'active',
        ]);
        $manager->assignRole('project_manager');

        $member = User::factory()->create([
            'name' => 'Team Member',
            'email' => 'member@notion-clone.test',
            'status' => 'active',
        ]);
        $member->assignRole('member');

        $workspace = Workspace::create([
            'name' => 'Prestige Studio',
            'slug' => 'prestige-studio',
            'description' => 'Espacio principal de colaboración para proyectos, documentación y planificación de entregas.',
            'owner_id' => $superAdmin->id,
            'settings' => ['theme' => 'obsidian-sand'],
        ]);

        $workspace->users()->sync([
            $superAdmin->id => ['role' => 'owner', 'joined_at' => now()],
            $manager->id => ['role' => 'project_manager', 'joined_at' => now()],
            $member->id => ['role' => 'member', 'joined_at' => now()],
        ]);

        $project = Project::create([
            'workspace_id' => $workspace->id,
            'name' => 'Notion Clone Launch',
            'slug' => 'notion-clone-launch',
            'description' => 'Construir la primera versión segura con proyectos, tareas, páginas y búsqueda.',
            'status' => 'active',
            'priority' => 'high',
            'start_date' => now()->subWeek(),
            'due_date' => now()->addWeeks(3),
            'owner_id' => $manager->id,
            'icon' => 'rocket',
            'color' => '#0f766e',
            'is_favorite' => true,
        ]);

        $project->members()->sync([
            $manager->id => ['role' => 'project_manager'],
            $member->id => ['role' => 'member'],
        ]);

        $tasks = collect([
            ['title' => 'Modelar permisos del espacio de trabajo', 'status' => 'done', 'priority' => 'high', 'assignee_ids' => [$manager->id, $superAdmin->id]],
            ['title' => 'Construir CRUD de proyectos y tareas', 'status' => 'in_progress', 'priority' => 'urgent', 'assignee_ids' => [$member->id, $manager->id]],
            ['title' => 'Crear base del editor de páginas', 'status' => 'todo', 'priority' => 'medium', 'assignee_ids' => [$member->id]],
        ])->map(function (array $task, int $index) use ($project, $manager, $superAdmin) {
            $createdTask = Task::create([
                'project_id' => $project->id,
                'title' => $task['title'],
                'description' => 'Tarea inicial de ejemplo para el espacio de trabajo predeterminado.',
                'status' => $task['status'],
                'priority' => $task['priority'],
                'assignee_id' => $task['assignee_ids'][0] ?? null,
                'reporter_id' => $manager->id,
                'due_date' => now()->addDays($index + 1),
                'completed_at' => $task['status'] === 'done' ? now()->subDay() : null,
                'position' => $index + 1,
            ]);

            $createdTask->assignees()->sync($task['assignee_ids']);

            return $createdTask;
        });

        $page = Page::create([
            'workspace_id' => $workspace->id,
            'project_id' => $project->id,
            'title' => 'Plan de lanzamiento',
            'slug' => Str::slug('Plan de lanzamiento'),
            'excerpt' => 'Resumen de hitos, decisiones y notas del despliegue.',
            'is_favorite' => true,
            'created_by' => $manager->id,
            'updated_by' => $manager->id,
        ]);

        Block::insert([
            [
                'page_id' => $page->id,
                'parent_id' => null,
                'type' => 'heading_1',
                'content_json' => json_encode(['text' => 'Plan de lanzamiento']),
                'position' => 1,
                'created_by' => $manager->id,
                'updated_by' => $manager->id,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'page_id' => $page->id,
                'parent_id' => null,
                'type' => 'paragraph',
                'content_json' => json_encode(['text' => 'Lanzar un espacio interno seguro con flujos pulidos de proyectos, tareas y páginas.']),
                'position' => 2,
                'created_by' => $manager->id,
                'updated_by' => $manager->id,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
