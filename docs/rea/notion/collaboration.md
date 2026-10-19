# Colaboración, comentarios y permisos

## Comportamiento de referencia

La ayuda pública de Notion describe comentarios de nivel de página y comentarios inline, respuestas, resolución/reapertura, edición/borrado, menciones de personas o grupos y reacciones. También describe permisos de página y señales de presencia/última edición.

Fuentes: [comments, mentions and reminders](https://www.notion.com/help/comments-mentions-and-reminders) y [sharing and permissions](https://www.notion.com/help/sharing-and-permissions).

## Estado de CrewSync

- Comentarios y respuestas existen para tareas y recursos polimórficos.
- Hay adjuntos, notificaciones por correo y autorización por policy.
- `task_user` permite múltiples responsables y `assignee_id` se conserva por compatibilidad.
- No hay evidencia de menciones inline, presencia en vivo, historial de edición ni permisos por bloque.

## Evidencia autenticada REA

El diálogo `Compartir` observado en `REMEXPERIENCE` mostró invitación por correo/grupo, dos colaboradores con acceso completo y acceso general mediante enlace con permiso de edición. También expone `Publicar`, `Avanzado`, `Copiar enlace` y `Descartar`. La captura fue de solo lectura; ver [runtime-evidence.md](runtime-evidence.md).

## Reglas de implementación

1. Mantener autorización en backend y scopes antes de serializar cualquier feed.
2. Validar que comentario, respuesta y adjunto pertenezcan al recurso solicitado.
3. Añadir menciones como relación explícita y notificación deduplicada, no como texto sin resolver.
4. Si se incorpora presencia, tratarla como señal efímera; no mezclarla con `activities` auditables.
5. Resolver un comentario no debe eliminarlo ni romper respuestas existentes.

## Aceptación propuesta

- Un usuario autorizado puede crear, responder, editar, resolver y reabrir un comentario.
- Una mención solo notifica a usuarios pertenecientes al workspace y visibles para el recurso.
- Un usuario sin permiso no puede mutar comentarios mediante una request directa.
- Los cambios de asignación/comentario conservan las notificaciones actuales.
