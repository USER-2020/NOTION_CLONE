# Vistas, filtros, orden y agrupación

## Comportamiento de referencia

Notion documenta vistas Table, Board, Timeline, Calendar, List, Gallery y Chart. Cada vista puede tener sus propios filtros, orden, agrupación y propiedades visibles; varias vistas pueden apuntar a la misma base. El calendario representa fechas de los registros y el board agrupa tarjetas por una propiedad seleccionada.

Fuente: [Database views, filters, sorts & groups](https://www.notion.com/help/views-filters-and-sorts) y [cuándo usar cada vista](https://www.notion.com/help/guides/when-to-use-each-type-of-database-view).

## Traducción a CrewSync

| Vista | Base funcional disponible | Trabajo pendiente |
|---|---|---|
| Table | Listados de tareas/proyectos | Motor genérico de columnas y celdas |
| Board | Tablero de tareas con `@dnd-kit` y vistas guardadas por usuario/workspace | Generalizar fuente y configuración para páginas y bases genéricas |
| List | Índices de páginas/proyectos | Persistir vistas y propiedades |
| Calendar | Fechas de tareas | Filtros y actualización segura de fechas |
| Timeline | No disponible | Definir intervalos, escala y conflictos |
| Gallery | Logos/portadas existentes | Definir tarjeta, campos y accesibilidad |
| Chart | No disponible | Posponer hasta estabilizar agregaciones |

## Evidencia autenticada REA

En `REMEXPERIENCE` se observó una vista de tablero real con columnas de estado y conteos. El menú de la vista ofrece renombrar, editar, copiar el enlace, duplicar y cambiar la representación a `Texto e ícono`, `Solo texto` o `Solo ícono`. También están presentes búsqueda contextual, filtros, orden, automatizaciones y configuración. La evidencia y sus límites están en [runtime-evidence.md](runtime-evidence.md).

### Interacción con tarjetas

Una tarjeta seleccionada conserva el contexto de la vista y se abre como página en un panel lateral. El panel permite consultar propiedades, comentarios y acciones de página; `Abrir como página completa` ofrece una segunda superficie de edición. Ver [Flujo observado de una tarjeta](runtime-evidence.md#flujo-observado-de-una-tarjeta).

La evidencia no confirma las opciones ni la persistencia del selector de `Estado`; ese comportamiento debe verificarse en una inspección posterior antes de convertirlo en contrato funcional.

### Primera iteración implementada en CrewSync

El tablero de tareas ahora permite guardar y cargar vistas personales dentro del workspace activo. Una vista conserva el tipo de presentación y los filtros de prioridad y estado; el servidor limita cada registro al usuario propietario y al workspace actual. Esta implementación cubre la primera vertical de vistas, pero todavía no generaliza las vistas a páginas o bases de datos personalizadas.

## Contrato técnico sugerido

Una vista debe guardar `source_type`, `source_id`, `view_type`, `filters`, `sorts`, `group_by`, `visible_properties` y `is_default`. Los filtros se validan contra propiedades permitidas y se aplican al query antes de serializar. El drag-and-drop debe preservar el contrato actual `{ status, position }` para tareas.

## Casos límite

- Filtros sobre valores nulos y fechas sin zona horaria.
- Registros archivados o eliminados mientras una vista está abierta.
- Agrupación con valores nuevos o sin valor.
- Orden estable cuando dos registros comparten la misma posición.
- Permisos que cambian entre la carga de la vista y una mutación.

## Aceptación propuesta

- Dos vistas de una fuente muestran el mismo conjunto autorizado, pero pueden configurarse de forma independiente.
- Cambiar una tarjeta de board actualiza el registro y la vista relacionada sin saltarse policies.
- Recargar conserva configuración y orden.
