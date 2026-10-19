# Frontend, diseño y pruebas

## Frontend

- Entrada: `resources/js/app.jsx`. Resuelve automáticamente `Pages/**/*.jsx` y mantiene `light`, `dark` o `system` con `notion-clone-theme` en `localStorage`.
- Layout autenticado: `Layouts/AuthenticatedLayout.jsx`. Usa los props globales de Inertia, navegación guiada por permisos, selector de workspace, sidebar colapsable y navegación móvil.
- Componentes reutilizables notables: `AppSelect`, `AppDatePicker`, `MemberMultiSelect`, `LogoUploadField`, `AppToaster`, `BrandLogo` y `RichTextEditor`.
- `RichTextEditor` produce HTML en `contentEditable` y puede subir una imagen a la ruta de adjuntos de una tarea. Si se reutiliza, proveer `imageUploadUrl` solo cuando el recurso esté creado y el endpoint acepte JSON.
- El diseño usa Tailwind y variables/clases `theme-*` definidas en `resources/css/app.css`. Mantenerlas en vez de incorporar un sistema visual paralelo.
- El tablero de tareas usa `@dnd-kit`; preservar las rutas de movimiento y el contrato `{ status, position }`.
- El panel lateral de tarea funciona como edición rápida tipo Notion: `Ctrl/Cmd + K` enfoca la búsqueda, `Guardar cambios` persiste sin cerrar el canvas, `Esc` cierra guardando cambios pendientes y el panel conserva `role="dialog"`/`aria-modal`. La selección se refleja en `task_id` para permitir recarga/enlace directo.
- El dashboard y el layout compartido usan los tokens graphite/violeta de `resources/css/app.css` y los bloques `dashboard-*`; conservar esta capa para que proyectos, tareas y documentación mantengan la misma jerarquía visual.

## Task canvas y modal

- El detalle de tarea usa `.task-detail-property-column` para mantener las propiedades en una columna lateral en escritorio y volverlas apiladas en movil.
- El modal de creacion usa `.task-create-modal`, `.task-create-section` y `.task-create-field`; conservar esas clases al ampliar el formulario.

## Dashboard y graficos

- `DashboardController` entrega `taskStatusDistribution`, `taskPriorityDistribution` y `weeklyCompletion` usando solo tareas visibles para el usuario y el workspace actual.
- `Dashboard.jsx` representa esas colecciones con SVG/CSS nativo, sin una libreria de charts ni metricas inventadas. Las categorias con cero resultados se conservan para que la leyenda sea estable.
- Si se agregan estados o prioridades, actualizar las claves del controller, las etiquetas/colores de `Dashboard.jsx` y `DashboardMetricsTest`.

## Contratos UI/backend

- Usa Ziggy (`route(...)`) para URLs desde React.
- Para logos, los formularios usan `forceFormData: true`; en actualizaciones con POST se adjunta `_method: 'patch'`.
- La API pública es mínima: `GET /api/user` bajo Sanctum. El producto se comunica principalmente por rutas web/Inertia, no crear endpoints API duplicados sin necesidad.
- `routes/web.php` protege el área principal con `auth`, `verified` y `password.change.required`. Perfil usa solo `auth`.

## Correo en pruebas

`TaskAndMemberNotificationTest` usa `APP_ENV=testing` y `Notification::fake`; no depende de un SMTP local. El modo de desarrollo y la activación de un proveedor real están documentados en [email-notifications.md](email-notifications.md).

## Pruebas existentes

- `AuthorizationFlowTest`: visibilidad de proyectos/tareas/páginas y límites para member.
- `ProjectParticipantSyncTest`: pivots de manager/member de proyecto.
- `TaskAndMemberNotificationTest`: bienvenida, asignación, cambios de estado y comentarios.
- `MemberTaskScheduleAndCommentAttachmentTest`: fechas de miembro y adjuntos de comentarios.
- `WorkspaceAndProjectLogoUploadTest`: subida de logos, payload Inertia y borrados.
- `DashboardMetricsTest`: distribuciones reales del dashboard y tendencia semanal de completado.
- `UserManagementUpdateTest`: edición, varios workspaces y desactivación de usuarios.
- Los tests Breeze de `tests/Feature/Auth/` cubren autenticación, registro, recuperación, verificación y contraseña.

Para cambios focalizados:

```powershell
php artisan test tests/Feature/AuthorizationFlowTest.php
php artisan test tests/Feature/TaskAndMemberNotificationTest.php
php artisan test
npm run build
```

Escoge el test específico por módulo antes de ejecutar toda la suite. Usa `RefreshDatabase` y si el escenario depende de permisos, ejecuta `RolesAndPermissionsSeeder` en `setUp` como hacen las pruebas existentes.

## Lista de comprobación

1. ¿El controller usa el scope de visibilidad y la policy adecuados?
2. ¿La validación impide IDs de recursos fuera del workspace/proyecto visible?
3. ¿Los datos serializados coinciden con lo que la página React espera?
4. ¿La UI respeta permisos y estado de carga/errores del formulario?
5. ¿Hay una prueba para la nueva autorización, relación o efecto secundario?
6. ¿Compila `npm run build` si cambió el frontend?
