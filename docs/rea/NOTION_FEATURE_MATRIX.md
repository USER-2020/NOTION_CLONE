# Matriz de paridad Notion / CrewSync

La columna de referencia enlaza documentación pública de Notion y, cuando aplica, el estado local REA. No declara paridad ni sustituye una sesión autenticada.

| Funcionalidad | Referencia documentada | CrewSync actual | Acción inicial | Estado |
|---|---|---|---|---|
| Workspaces, sidebar y favoritos | Auditoría local + evidencia REA autenticada | Workspaces y selector; favoritos parciales en proyectos/páginas | Comparar navegación y estados | Observado en Notion |
| Páginas anidadas | [Editor](notion/block-editor.md) | Implementadas | Comparar límites | Documentado local |
| Editor por bloques | [Editor](notion/block-editor.md) | Parcial: bloque `paragraph` + HTML básico | Extender tras fijar contrato | Brecha confirmada |
| Bases de datos | [Bases de datos](notion/databases.md) + runtime REA | No hay módulo dedicado | Diseñar modelo y decisión de fuentes | Brecha confirmada / referencia observada |
| Table / Board / List | [Vistas](notion/views.md) + runtime REA | Board de tareas, sin vistas genéricas | Evaluar modelo de vistas | Brecha confirmada / board observado |
| Calendar / Timeline / Gallery | [Vistas](notion/views.md) | No verificadas como vistas de producto | Evaluar por etapas | Brecha confirmada |
| Comentarios y colaboración | [Colaboración](notion/collaboration.md) + runtime REA | Comentarios, respuestas y correo | Extender menciones/presencia si aplica | Parcial / permisos observados |
| Búsqueda y navegación rápida | [Búsqueda](notion/search-productivity.md) + runtime REA | No hay búsqueda global documentada | Implementar tras requisitos | Brecha confirmada / búsqueda contextual observada |
| Responsables múltiples | No aplica a paridad directa | Implementado con `task_user` | Conservar como diferenciador | Implementado local |
| Dependencias e hitos | No aplica a paridad directa | No implementados | Implementar como capacidad CrewSync | Pendiente diseño |

## Estado REA

REA está configurado y produjo evidencia estática de CrewSync y evidencia autenticada de Notion. El proveedor JavaScript quedó limitado por el self-test nativo de Windows; la observación web por CDP sí quedó disponible. Ver [`REA_SETUP.md`](REA_SETUP.md), [`notion/crewsync-static-analysis.md`](notion/crewsync-static-analysis.md) y [`notion/runtime-evidence.md`](notion/runtime-evidence.md).

## Regla de actualización

Sustituir una brecha solo cuando exista una referencia a evidencia concreta y reproducible. Separar siempre la observación de Notion, la observación de CrewSync y la decisión de producto.
