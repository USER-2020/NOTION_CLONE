# CrewSync Core — auditoría inicial

Fecha de auditoría: 2026-10-18  
Repositorio: `USER-2020/NOTION_CLONE` (copia local en la raíz del proyecto)

## Alcance y evidencia

Esta auditoría se basa en el código local, migraciones, rutas, policies, seeders, pantallas React, tests de feature, `README.md`, `CODEX.md` y `docs/notion-clone-context`. No se atribuyen aquí comportamientos de Notion: la investigación REA queda pendiente porque el servidor REA no está conectado al contexto MCP actual.

## Estado técnico

| Área | Estado | Evidencia local |
|---|---|---|
| Laravel/Inertia/React | Operativo | `composer.json`, `package.json`, `resources/js/app.jsx` |
| Autenticación Breeze | Implementado | `routes/auth.php`, `app/Http/Controllers/Auth`, tests `Feature/Auth` |
| Roles y permisos | Implementado | Spatie, `RolesAndPermissionsSeeder`, policies y `Gate::before` |
| Workspaces | Implementado | CRUD, selector de workspace activo, logos y tests |
| Proyectos | Implementado | CRUD, miembros por rol, fechas, logos y tests |
| Tareas | Implementado | tablero, estados, posiciones, responsables múltiples, subtareas, fechas |
| Comentarios/adjuntos | Implementado | comentarios anidados, adjuntos polimórficos, validación y notificaciones |
| Páginas/documentos | Parcial | páginas anidadas y bloques, pero el cuerpo se persiste como un solo `paragraph` |
| Editor de bloques | Parcial | `RichTextEditor` ofrece HTML básico; no existe un catálogo completo de bloques |
| Dashboard | Implementado | métricas por workspace y actividad reciente del usuario |
| PWA | Configurado | `vite-plugin-pwa`, manifest y service worker en `public/` |
| Notificaciones | Parcial | correo de bienvenida y eventos de tareas; no hay centro de notificaciones/presencia |
| Labels | Modelo/parcial | migraciones y relaciones existen, sin módulo UI/CRUD claramente expuesto |
| Activity | Persistencia/parcial | modelo y dashboard consumen actividad; falta historial navegable completo |

## Funcionalidad existente

### Acceso y seguridad

- Registro, login, logout, recuperación, confirmación y verificación de correo.
- Bloqueo de navegación hasta cambiar la contraseña cuando `must_change_password` está activo.
- Roles: `super_admin`, `admin`, `project_manager`, `member`, `viewer`.
- Policies para Workspace, Project, Task, Page, Block y Attachment.
- Scopes `visibleForUser` en Workspace, Project, Task y Page.

### Gestión de trabajo

- Múltiples workspaces y selección persistida en sesión.
- Proyectos ligados a workspace, owner, managers y members mediante `project_user`.
- Tareas con estados `backlog`, `todo`, `in_progress`, `review`, `done`, `blocked`.
- Responsables múltiples mediante `task_user`, con `assignee_id` legado conservado como primer responsable.
- Subtareas en la misma tabla `tasks`, drag-and-drop y reordenamiento por posición.
- Fechas de inicio y vencimiento con permisos especiales para miembros.
- Comentarios con respuestas, adjuntos y notificaciones a participantes.

### Documentación

- Páginas por workspace o proyecto, jerarquía padre/hijo, favoritas y páginas relacionadas.
- Modelo `blocks` con JSON, pero `PageController` sincroniza actualmente solo el primer bloque `paragraph` del cuerpo.
- Pantalla de documentación pública interna que enlaza DeepWiki; no debe confundirse con la investigación REA de esta fase.

## Incompletos o ausentes para CrewSync 2.0

Estas etiquetas describen el core local, no paridad con Notion:

1. Editor de bloques completo: headings, checklist, callouts, citas, código, tablas, bloques anidados editables, slash commands, duplicación y menú contextual.
2. Bases de datos configurables: propiedades, tipos, relaciones, rollups, fórmulas, plantillas, filtros y agrupaciones.
3. Vistas de registros: una representación compartida entre tabla, board, list, calendar, timeline y gallery, con configuración persistida.
4. Búsqueda global/contextual, quick navigation y atajos de productividad.
5. Colaboración avanzada: menciones, compartir granular, presencia, historial y edición simultánea.
6. Capacidades propias CrewSync: My Work, dependencias, hitos, calendario global, timeline de proyectos, métricas y automatizaciones.
7. Centro de notificaciones y lectura de actividad más allá del correo y las últimas actividades del dashboard.
8. QA sistemático responsive, sincronización entre vistas y pruebas de rendimiento para los módulos nuevos.

## Puntos para refactorizar con cuidado

- `PageController::uniqueSlug` busca el slug globalmente aunque la restricción de base es `workspace_id + slug`; antes de cambiarlo, decidir si la URL debe ser global o contextual.
- `TaskController::nextPosition` calcula el máximo por estado a nivel global, mientras `move` reordena tareas visibles del usuario; hay riesgo de colisiones o posiciones sorprendentes entre proyectos.
- Las rutas de adjuntos de tareas autorizan con `TaskPolicy::update`, mientras `AttachmentPolicy::create` requiere `files.manage`; unificar solo con una decisión explícita y pruebas.
- La compatibilidad `assignee_id`/`task_user` debe mantenerse al migrar hacia responsables múltiples.
- No reemplazar el modelo de páginas/bloques por otro antes de revisar cascadas, scopes y serialización Inertia.

## Orden recomendado posterior a REA

1. Documentar evidencia de Notion por módulo y separar observación de inferencia.
2. Completar matriz de paridad y seleccionar un alcance vertical pequeño.
3. Priorizar editor de bloques y base de datos/vistas solo después de fijar sus contratos de persistencia.
4. Implementar una capacidad completa de extremo a extremo con migración, validación, autorización, Inertia, React y tests.
5. Repetir por módulo antes de iniciar el rediseño Deluxe.

## Verificación pendiente

- Ejecutar la suite PHP completa y el build frontend en el entorno con dependencias instaladas.
- Conectar/reiniciar REA y conservar sus resultados reales bajo `docs/rea/notion/`.
- No marcar funcionalidades de Notion como investigadas, implementadas o verificadas hasta contar con evidencia y pruebas propias.
