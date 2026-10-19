# Datos, visibilidad y seguridad

## Relaciones principales

```text
User --< workspace_user >-- Workspace --< Project --< Task --< Task (subtarea)
  |                                  |              |
  |                                  |              `--< task_user >-- User
  |                                  `--< Page --< Block
  `--< project_user >-- Project

Task/Page/Comment --< (morph) Comment
Task/Page/Comment --< (morph) Attachment
Activity --(morph subject)--> recurso opcional
```

## Datos demo locales

`database/seeders/DashboardDemoSeeder.php` crea datos de muestra para revisar el panel, proyectos, tareas, paginas y actividad sin modificar el seeder base. Es repetible porque identifica proyectos por `workspace_id + slug`, tareas por proyecto + titulo y elimina solo las actividades marcadas con `demo_seed=dashboard-demo`.

```powershell
php artisan db:seed --class=DashboardDemoSeeder
```

El seeder esta pensado para desarrollo local y no debe agregarse automaticamente al flujo de produccion.

Tablas de producto: `users`, `workspaces`, `workspace_user`, `projects`, `project_user`, `tasks`, `task_user`, `labels`, `label_task`, `pages`, `blocks`, `comments`, `attachments` y `activities`; además de las tablas de Spatie Permission.

## Scopes de visibilidad

- `Workspace::visibleForUser`: super_admin/admin ven todos; otros ven los propios o con membresía de workspace.
- `Project::visibleForUser`: super_admin/admin ven todos; otros ven los propios, donde son miembros o proyectos de un workspace al que pertenecen.
- `Task::visibleForUser`: primero limita a proyectos visibles. Si no tiene `tasks.manage`, limita además a tareas asignadas mediante `assignee_id` o `task_user`.
- `Page::visibleForUser`: requiere workspace visible y, cuando pertenece a proyecto, proyecto visible.

Partir siempre de estos scopes en nuevas consultas. Una policy por sí sola evita el acceso individual, pero no evita que un índice filtre incorrectamente.

## Roles y permisos

Roles globales: `super_admin`, `admin`, `project_manager`, `member`, `viewer`.

- `super_admin`: todos los permisos y `Gate::before` le concede toda habilidad.
- `admin`: todos los permisos, salvo las restricciones específicas para manejar cuentas super_admin.
- `project_manager`: administra workspaces visibles (actualizar/eliminar), crea/edita proyectos, gestiona tareas, páginas y archivos; no administra usuarios ni roles.
- `member`: ve recursos visibles, solo ve tareas asignadas, puede mover/fechar tareas visibles y comentar; no crea ni edita tareas, proyectos, workspaces ni páginas.
- `viewer`: solo lectura.

Permisos seed: `dashboard.view`, `users.manage`, `roles.manage`, `workspaces.*`, `projects.*`, `tasks.view`, `tasks.manage`, `pages.view`, `pages.edit`, `comments.create`, `files.manage`, `activity.view`.

Las policies cubren Workspace, Project, Task, Page, Block y Attachment. Los controllers deben hacer `authorize(...)` antes de mutar o serializar recursos individuales.

## Validaciones y límites importantes

- Proyecto: `due_date >= start_date`; sus participantes son IDs de usuarios existentes.
- Tarea: proyecto visible; responsables y responsables de subtareas son miembros/owner del proyecto; padre y subtarea deben compartir proyecto; fecha final no es anterior a inicio.
- Página: workspace visible; el proyecto visible debe pertenecer a ese workspace; la página padre debe ser visible y del mismo workspace/proyecto.
- Comentario: máximo 3.000 caracteres. Las respuestas solo pueden apuntar a un comentario de la misma tarea.
- Adjuntos de tarea/comentario: imágenes comunes, PDF, TXT, DOC y DOCX; máximo 10 MB por archivo. Logos: JPG/JPEG/PNG/WEBP/SVG; máximo 4 MB.

## Efectos secundarios

- Las tareas notifican por correo al recibir un nuevo responsable, cambiar de estado o recibir comentarios cuando el correo está habilitado.
- Crear usuario intenta enviar la bienvenida bajo la política de correo y puede marcar `must_change_password`.
- Los logos reemplazados y adjuntos eliminados se borran del disco `public` antes de eliminar el registro.
- La eliminación de workspaces/proyectos/páginas depende de restricciones `cascadeOnDelete`/`nullOnDelete` de las migraciones; antes de cambiarla, verificar la migración y el efecto sobre archivos de almacenamiento.

## Política de correo

- Las tareas notifican por correo al recibir un nuevo responsable, cambiar de estado o recibir comentarios cuando `MAIL_NOTIFICATIONS_ENABLED=true` y existe un proveedor válido.
- Crear usuario intenta enviar la bienvenida bajo la misma política y puede marcar `must_change_password`.
- Con el correo deshabilitado, estas notificaciones son no-op y no bloquean la persistencia de tareas, subtareas, comentarios o usuarios.
- Consulta [email-notifications.md](email-notifications.md) para configurar SMTP y diagnosticar errores de transporte.

## Puntos de cuidado al extender

- `PageController::uniqueSlug` consulta el slug globalmente aunque la base permite repetición entre workspaces; no asumir que la URL identifica workspace.
- `TaskController::nextPosition` calcula el máximo global por estado, mientras el movimiento reordena las tareas visibles del usuario. Mantener este comportamiento o corregirlo explícitamente con cobertura de pruebas, no accidentalmente.
- `AttachmentPolicy::create` exige `files.manage`, pero las rutas de adjuntos de tareas autorizan con `TaskPolicy::update`; conservar esta diferencia al introducir nuevas superficies de archivos.
