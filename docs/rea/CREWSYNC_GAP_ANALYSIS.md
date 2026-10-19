# CrewSync 2.0 — análisis de brechas inicial

Este documento separa brechas detectadas en el core local de cualquier afirmación sobre Notion. Las brechas de paridad requieren investigación REA antes de priorizar implementación.

## Brechas funcionales locales

### Alta prioridad arquitectónica

- Editor de bloques real y extensible.
- Modelo de bases de datos y propiedades configurables.
- Vistas múltiples sobre el mismo conjunto de registros.

### Prioridad de productividad

- Búsqueda global/contextual y navegación rápida.
- Centro de notificaciones.
- Calendario global, timeline y My Work.
- Dependencias, hitos y métricas de proyecto.

### Colaboración avanzada

- Menciones y compartir con permisos más granulares.
- Presencia y edición simultánea.
- Historial navegable y recuperación de cambios.

## Restricciones

- Mantener Laravel 10, React 18, Inertia, Spatie Permissions y relaciones/scopes existentes.
- No implementar una capacidad solo visual.
- Cada vertical nueva debe tener persistencia, validación, policy/scope, controller/ruta, props Inertia, UI y pruebas.
- No decidir contratos de base de datos inspirados en Notion sin evidencia documentada y una decisión explícita de CrewSync.

## Próximo paso

Completar investigación REA de editor de bloques y bases de datos. Después actualizar esta lista con observaciones, impacto, riesgos de migración y decisión `reutilizar`, `refactorizar`, `extender`, `implementar` o `descartar`.
