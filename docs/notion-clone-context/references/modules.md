# Módulos funcionales y rutas

## Acceso y perfil

- Breeze ofrece registro, inicio/cierre de sesión, recuperación/restablecimiento de contraseña, confirmación y verificación de correo en `routes/auth.php`.
- `EnsurePasswordIsChanged` intercepta las rutas principales para usuarios con `must_change_password`; solo permite perfil, cambio de contraseña y logout hasta cumplirlo.
- Perfil: `GET/PATCH/DELETE /profile`; `PATCH /profile/theme` acepta la preferencia visual persistida del usuario.

## Dashboard

`GET /dashboard` usa el workspace activo y los scopes de visibilidad para entregar:

- contadores de proyectos, pendientes, vencidas y completadas en la semana;
- tareas con vencimiento hoy;
- proyectos favoritos y progreso calculado por tareas completadas;
- últimas actividades del usuario actual.

Pantalla: `resources/js/Pages/Dashboard.jsx`.

## Workspaces

Rutas: `GET/POST /workspaces`, `PATCH /workspaces/current`, `PATCH/DELETE /workspaces/{workspace}`.

`WorkspaceController` permite crear, editar, elegir el workspace activo y eliminar. Al crear, registra propietario en `workspace_user`; si quien crea no es el propietario escogido, entra como admin. Soporta logo opcional y eliminación del archivo reemplazado. Pantalla: `Pages/Workspaces/Index.jsx`.

## Proyectos

Rutas resource sin `create`/`edit`: `GET /projects`, `POST /projects`, `GET /projects/{project}`, `PATCH /projects/{project}`, `DELETE /projects/{project}`.

Cada proyecto pertenece a un workspace, tiene owner, estado, prioridad, fechas, color, icono, favorito y logo. La actualización sincroniza dos conjuntos excluyentes en `project_user`: `manager_ids` con pivot `project_manager`, y `member_ids` con pivot `member`. Pantallas: `Pages/Projects/Index.jsx` y `Show.jsx`.

## Tareas y subtareas

Rutas principales:

- `GET /tasks` admite query `project_id` y `task_id`.
- `POST/PATCH/DELETE /tasks/{task}` crea, actualiza y elimina tareas.
- `PATCH /tasks/{task}/move` recibe estado y posición para tablero drag-and-drop.
- `PATCH /tasks/{task}/schedule` actualiza fechas; miembros pueden hacerlo en tareas visibles/asignadas.
- `POST /tasks/{task}/subtasks`, y rutas análogas `PATCH/DELETE` bajo `/subtasks/{subtask}`.
- `POST /tasks/{task}/comments` permite comentario, respuesta y archivos.
- `POST/DELETE /tasks/{task}/attachments` gestiona adjuntos. El POST devuelve JSON si el cliente pide JSON; lo usa el editor enriquecido para imágenes.

Estados de tarea padre: `backlog`, `todo`, `in_progress`, `review`, `done`, `blocked`. Subtareas: `todo`, `in_progress`, `done`, `blocked`. Prioridades: `low`, `medium`, `high`, `urgent`.

El movimiento normaliza posiciones en una transacción. Al completar se rellena `completed_at`; al salir de `done` se limpia. Los responsables deben pertenecer al proyecto. Se notifican nuevas asignaciones, cambios de estado y comentarios a participantes relevantes. Pantalla: `Pages/Tasks/Index.jsx`.

El tablero también admite vistas guardadas por usuario y workspace mediante `task_views`. Cada vista conserva el tipo (`scrum`, `timeline` o `calendar`) y filtros de prioridad/estado. Las mutaciones pasan por `TaskViewController` y `TaskViewPolicy`; no se comparten entre usuarios de forma implícita.

## Páginas y bloques

Rutas: `POST /pages`, `GET/PATCH/DELETE /pages/{page:slug}`.

Una página puede ser del workspace o de un proyecto y puede anidarse bajo otra página compatible. El controller hoy trata el cuerpo como un bloque `paragraph` con `content_json.text`; `Page::blocks()` conserva la posibilidad del modelo por bloques. La pantalla `Pages/Pages/Show.jsx` usa el editor enriquecido y muestra páginas relacionadas.

## Usuarios

Rutas: `GET/POST /users`, `PATCH /users/{user}`, `PATCH /users/{user}/deactivate`.

`UserManagementController` crea usuarios, asigna rol global, sincroniza workspaces y puede exigir cambio de contraseña. La creación envía `MemberWelcomeNotification`. Un admin no puede seleccionar ni administrar a un `super_admin`; la validación de espacios aplica visibilidad y el rol de pivot.

## Documentación desde la aplicación

`GET /documentation` renderiza `Pages/Documentation/Index.jsx`; actualmente enlaza a DeepWiki. La skill de este directorio es documentación para agentes y no cambia esa pantalla pública.
