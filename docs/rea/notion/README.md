# Investigación de referencia: Notion

Este directorio separa tres tipos de información para que otro agente no mezcle hechos ni niveles de certeza:

1. **Documentación oficial pública**: comportamiento descrito por Notion en sus páginas de ayuda.
2. **Evidencia local REA**: inventario estático de CrewSync y sus límites operativos en Windows; ver `../REA_SETUP.md` y `crewsync-static-analysis.md`.
3. **Decisiones de CrewSync**: brechas, contratos y aceptación propuestos; ver `../CREWSYNC_GAP_ANALYSIS.md` y `../FEATURE_IMPLEMENTATION_PLAN.md`.

## Módulos documentados

- [Editor por bloques](block-editor.md)
- [Bases de datos](databases.md)
- [Vistas, filtros, orden y agrupación](views.md)
- [Colaboración, comentarios y permisos](collaboration.md)
- [Búsqueda y productividad](search-productivity.md)
- [Inventario estático de CrewSync](crewsync-static-analysis.md)
- [Evidencia REA en tiempo de ejecución](runtime-evidence.md)

## Método y límites

Las páginas de Notion citadas son fuentes públicas. La sesión autenticada inspeccionada con REA está separada en `runtime-evidence.md` y siempre conserva sus límites y `evidence_id`. No se copió código, branding ni assets propietarios. Cuando una capacidad no está descrita en una fuente pública o no existe evidencia local, se marca como pendiente y no como ausencia definitiva.

Fuentes principales:

- https://www.notion.com/help/intro-to-databases
- https://www.notion.com/help/views-filters-and-sorts
- https://www.notion.com/help/guides/when-to-use-each-type-of-database-view
- https://www.notion.com/help/comments-mentions-and-reminders
- https://www.notion.com/help/sharing-and-permissions
- https://www.notion.com/en-gb/help/search
