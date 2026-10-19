# Búsqueda y productividad

## Comportamiento de referencia

Notion documenta búsqueda desde el sidebar, atajos `Cmd/Ctrl+P` o `Cmd/Ctrl+K`, páginas recientes, búsqueda exacta con comillas y búsqueda de comandos. La búsqueda debe distinguir resultados de páginas/documentos de acciones rápidas.

Fuente: [Search](https://www.notion.com/en-gb/help/search).

## Brecha de CrewSync

No hay una búsqueda global documentada en la aplicación actual. El dashboard y los índices son navegación por módulo, no un índice transversal de workspaces, proyectos, tareas y páginas.

## Evidencia autenticada REA

La base `REMEXPERIENCE` expone un botón `Buscar` que abre el campo `Escribe para buscar…` sin cambiar la URL, lo que confirma una búsqueda contextual de la vista. El sidebar expone además `Buscar o preguntar` con el atajo `Ctrl+K`. Esto no demuestra todavía el alcance ni el ranking de la búsqueda global. Ver [runtime-evidence.md](runtime-evidence.md).

## Diseño mínimo recomendado

- Endpoint autenticado `GET /search?q=&type=&workspace_id=` con paginación.
- Alcance por `visibleForUser` antes de aplicar coincidencia textual.
- Resultados normalizados con `type`, `id`, `title`, `url`, `workspace`, `snippet`, `updated_at` y permisos disponibles.
- Debounce en cliente, estado de carga/vacío/error y navegación con Ziggy.
- Atajos de teclado sin interferir con el editor ni formularios.

## Casos límite

- Consulta vacía o menor al mínimo de caracteres.
- Títulos duplicados en workspaces distintos.
- Registro archivado, eliminado o sin permiso durante la navegación.
- HTML de snippets que no debe ejecutarse.
- Búsqueda de tareas asignadas frente a tareas visibles para managers.

## Aceptación propuesta

- Un usuario solo recibe resultados que podría abrir directamente.
- La búsqueda encuentra páginas, proyectos y tareas por título y texto permitido.
- Enter abre el resultado; Escape cierra la paleta; el editor conserva el foco cuando corresponde.
- La paginación y el orden por relevancia/actualización son deterministas.
