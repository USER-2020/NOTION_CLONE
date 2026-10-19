---
name: notion-clone-context
description: Mantén o amplía NOTION_CLONE con contexto fiable de su arquitectura Laravel/Inertia, módulos, datos, permisos y convenciones. Úsala al trabajar en este repositorio; no la uses para aplicaciones Laravel ajenas.
---

# Contexto de NOTION_CLONE

Usa esta skill al intervenir en `NOTION_CLONE`. Su objetivo es preservar las reglas funcionales ya implementadas y evitar exploración innecesaria.

## Antes de cambiar código

1. Lee [overview.md](references/overview.md) para ubicar el stack, puntos de entrada y convenciones locales.
2. Para una funcionalidad concreta, consulta el apartado pertinente de [modules.md](references/modules.md).
3. Si la modificación toca visibilidad, roles, relaciones o persistencia, lee [data-and-security.md](references/data-and-security.md) antes de implementarla.
4. Para UI, rutas Inertia, estilos o validación, consulta [frontend-and-testing.md](references/frontend-and-testing.md).
5. Para continuar la auditoría de paridad con Notion, usa el índice de [documentación REA](../rea/notion/README.md), el estado de conexión en [REA_SETUP.md](../rea/REA_SETUP.md) y el paquete de traspaso en [CREWSYNC_AGENT_HANDOFF.md](../CREWSYNC_AGENT_HANDOFF.md).

Antes de cambiar notificaciones o SMTP, consulta [email-notifications.md](references/email-notifications.md) para respetar el modo local sin correo.

## Invariantes que no se deben romper

- La visibilidad no se resuelve solo en la interfaz: reutiliza los scopes `visibleForUser` y autoriza con policies en el servidor.
- El workspace activo está en `current_workspace_id` de sesión y se comparte globalmente por Inertia. Las listas principales se filtran por él.
- `tasks.assignee_id` conserva el primer responsable por compatibilidad; la fuente funcional para múltiples responsables es `task_user` / `Task::assignees()`.
- Las tareas padre y subtareas comparten la tabla `tasks`; una subtarea debe tener el mismo proyecto que su padre.
- Una página guarda su cuerpo editable en el primer bloque `paragraph`; no sustituyas esta sincronización por una columna nueva sin una migración y una decisión explícita.
- Los adjuntos y comentarios son polimórficos. Valida siempre que el recurso padre corresponda al adjunto/comentario solicitado.
- La interfaz recibe permisos y roles en `props.auth`; sigue existiendo una validación de permisos en backend para toda mutación.

## Forma de trabajar

- Aplica cambios pequeños y focalizados; respeta `CODEX.md`.
- Para una capacidad nueva, conecta el recorrido completo: migración/modelo si hace falta, request de validación, policy/authorization, controller+ruta, props Inertia, UI y prueba de feature proporcionada al riesgo.
- No agregues dependencias ni hagas refactors arquitectónicos sin solicitud explícita.
- Prueba al menos el archivo de test relacionado y `npm run build` si se modifica React, CSS o Vite.

## Referencias

- [Correo y notificaciones](references/email-notifications.md)
- [Panorama y arranque](references/overview.md)
- [Módulos funcionales y rutas](references/modules.md)
- [Modelo de datos, visibilidad y seguridad](references/data-and-security.md)
- [Frontend, diseño y pruebas](references/frontend-and-testing.md)
