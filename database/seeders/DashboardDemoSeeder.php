<?php

namespace Database\Seeders;

use App\Models\Activity;
use App\Models\Block;
use App\Models\Page;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Datos locales, repetibles y no destructivos para revisar el dashboard.
 *
 * Ejecutar con:
 * php artisan db:seed --class=DashboardDemoSeeder
 */
class DashboardDemoSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::query()->where('email', 'admin@notion-clone.test')->first();

        if (! $admin) {
            $admin = User::create([
                'name' => 'Super Admin',
                'email' => 'admin@notion-clone.test',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'status' => 'active',
            ]);
        }

        $manager = User::query()->where('email', 'manager@notion-clone.test')->first() ?? $admin;
        $member = User::query()->where('email', 'member@notion-clone.test')->first() ?? $admin;

        $workspace = Workspace::query()->firstOrCreate(
            ['slug' => 'prestige-studio'],
            [
                'name' => 'Prestige Studio',
                'description' => 'Workspace demo para revisar proyectos, tareas y metricas.',
                'owner_id' => $admin->id,
            ],
        );

        $workspace->users()->syncWithoutDetaching([
            $admin->id => ['role' => 'owner'],
            $manager->id => ['role' => 'project_manager'],
            $member->id => ['role' => 'member'],
        ]);

        $projectDefinitions = [
            [
                'slug' => 'marketplace-catalog',
                'name' => 'Marketplace',
                'status' => 'active',
                'priority' => 'high',
                'color' => '#7c3aed',
                'is_favorite' => true,
                'due_date' => now()->addDays(7)->toDateString(),
                'tasks' => [
                    ['title' => 'Revisar validacion del catalogo', 'status' => 'todo', 'priority' => 'high', 'due' => 1, 'assignee' => $manager],
                    ['title' => 'Resolver bloqueo de inventario', 'status' => 'blocked', 'priority' => 'urgent', 'due' => -1, 'assignee' => $member],
                    ['title' => 'Aprobar cuentas de cobro', 'status' => 'done', 'priority' => 'medium', 'due' => -2, 'completed' => 3, 'assignee' => $admin],
                    ['title' => 'Preparar reporte de ventas', 'status' => 'in_progress', 'priority' => 'medium', 'due' => 4, 'assignee' => $member],
                ],
            ],
            [
                'slug' => 'website-onboarding',
                'name' => 'Website / Onboarding',
                'status' => 'active',
                'priority' => 'medium',
                'color' => '#0ea5e9',
                'is_favorite' => true,
                'due_date' => now()->addDays(12)->toDateString(),
                'tasks' => [
                    ['title' => 'Definir flujo de bienvenida', 'status' => 'review', 'priority' => 'medium', 'due' => 2, 'assignee' => $manager],
                    ['title' => 'Ajustar formularios de registro', 'status' => 'in_progress', 'priority' => 'high', 'due' => 5, 'assignee' => $member],
                    ['title' => 'Validar experiencia en movil', 'status' => 'backlog', 'priority' => 'low', 'due' => 8, 'assignee' => $member],
                    ['title' => 'Publicar guia de onboarding', 'status' => 'done', 'priority' => 'low', 'due' => -4, 'completed' => 1, 'assignee' => $admin],
                ],
            ],
            [
                'slug' => 'velvet-start-up',
                'name' => 'Velvet Start Up',
                'status' => 'planning',
                'priority' => 'high',
                'color' => '#ec4899',
                'is_favorite' => true,
                'due_date' => now()->addDays(18)->toDateString(),
                'tasks' => [
                    ['title' => 'Definir objetivos del lanzamiento', 'status' => 'todo', 'priority' => 'high', 'due' => 6, 'assignee' => $manager],
                    ['title' => 'Crear matriz de riesgos', 'status' => 'backlog', 'priority' => 'medium', 'due' => 10, 'assignee' => $member],
                    ['title' => 'Cerrar propuesta de equipos', 'status' => 'done', 'priority' => 'medium', 'due' => -5, 'completed' => 5, 'assignee' => $admin],
                ],
            ],
            [
                'slug' => 'rrss-marketing',
                'name' => 'RR.SS / Marketing',
                'status' => 'active',
                'priority' => 'medium',
                'color' => '#f59e0b',
                'is_favorite' => false,
                'due_date' => now()->addDays(23)->toDateString(),
                'tasks' => [
                    ['title' => 'Calendario de contenidos', 'status' => 'in_progress', 'priority' => 'medium', 'due' => 3, 'assignee' => $member],
                    ['title' => 'Medir conversion de campana', 'status' => 'review', 'priority' => 'urgent', 'due' => 9, 'assignee' => $manager],
                    ['title' => 'Preparar piezas de lanzamiento', 'status' => 'todo', 'priority' => 'low', 'due' => 14, 'assignee' => $member],
                ],
            ],
        ];

        foreach ($projectDefinitions as $definition) {
            $project = Project::query()->updateOrCreate(
                ['workspace_id' => $workspace->id, 'slug' => $definition['slug']],
                [
                    'name' => $definition['name'],
                    'description' => 'Proyecto demo para mostrar el avance y la coordinacion del equipo.',
                    'status' => $definition['status'],
                    'priority' => $definition['priority'],
                    'start_date' => now()->subDays(10)->toDateString(),
                    'due_date' => $definition['due_date'],
                    'owner_id' => $manager->id,
                    'icon' => 'folder',
                    'color' => $definition['color'],
                    'is_favorite' => $definition['is_favorite'],
                ],
            );

            $project->members()->syncWithoutDetaching([
                $manager->id => ['role' => 'project_manager'],
                $member->id => ['role' => 'member'],
            ]);

            foreach ($definition['tasks'] as $position => $taskDefinition) {
                $task = $project->tasks()->updateOrCreate(
                    ['title' => $taskDefinition['title']],
                    [
                        'description' => 'Tarea demo para revisar el tablero, el calendario y los indicadores.',
                        'status' => $taskDefinition['status'],
                        'priority' => $taskDefinition['priority'],
                        'assignee_id' => $taskDefinition['assignee']->id,
                        'reporter_id' => $admin->id,
                        'due_date' => now()->addDays($taskDefinition['due'])->toDateString(),
                        'completed_at' => isset($taskDefinition['completed'])
                            ? now()->subDays($taskDefinition['completed'])
                            : null,
                        'position' => $position + 1,
                    ],
                );

                $task->assignees()->sync([$taskDefinition['assignee']->id]);
            }

            $this->seedProjectPage($workspace, $project, $admin, $definition['name']);
        }

        $this->seedActivity($admin, $workspace);

        $this->command?->info('DashboardDemoSeeder: proyectos, tareas, paginas y actividad demo listos.');
    }

    private function seedProjectPage(Workspace $workspace, Project $project, User $author, string $projectName): void
    {
        $slug = Str::slug("{$project->slug}-brief");
        $page = Page::query()->updateOrCreate(
            ['workspace_id' => $workspace->id, 'slug' => $slug],
            [
                'project_id' => $project->id,
                'title' => "Brief de {$projectName}",
                'excerpt' => 'Objetivos, alcance y decisiones principales del proyecto.',
                'is_favorite' => true,
                'created_by' => $author->id,
                'updated_by' => $author->id,
            ],
        );

        Block::query()->updateOrCreate(
            ['page_id' => $page->id, 'position' => 1],
            [
                'type' => 'heading_1',
                'content_json' => ['text' => "Brief de {$projectName}"],
                'created_by' => $author->id,
                'updated_by' => $author->id,
            ],
        );

        Block::query()->updateOrCreate(
            ['page_id' => $page->id, 'position' => 2],
            [
                'type' => 'paragraph',
                'content_json' => ['text' => 'Documento demo para validar la experiencia de documentacion del workspace.'],
                'created_by' => $author->id,
                'updated_by' => $author->id,
            ],
        );
    }

    private function seedActivity(User $admin, Workspace $workspace): void
    {
        Activity::query()->where('user_id', $admin->id)->get()->filter(
            fn (Activity $activity) => ($activity->metadata_json['demo_seed'] ?? null) === 'dashboard-demo'
        )->each->delete();

        $activities = [
            ['action' => 'actualizo el brief de Marketplace', 'days' => 0],
            ['action' => 'completo Publicar guia de onboarding', 'days' => 1],
            ['action' => 'cambio la prioridad de Medir conversion de campana', 'days' => 2],
            ['action' => 'creo el proyecto Velvet Start Up', 'days' => 3],
            ['action' => 'agrego una tarea a RR.SS / Marketing', 'days' => 4],
            ['action' => 'programo una entrega del equipo', 'days' => 5],
        ];

        foreach ($activities as $activityDefinition) {
            $activity = Activity::create([
                'user_id' => $admin->id,
                'action' => $activityDefinition['action'],
                'metadata_json' => [
                    'demo_seed' => 'dashboard-demo',
                    'workspace_id' => $workspace->id,
                ],
            ]);

            $activity->created_at = now()->subDays($activityDefinition['days']);
            $activity->updated_at = $activity->created_at;
            $activity->save();
        }
    }
}
