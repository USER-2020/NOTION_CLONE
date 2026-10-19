# Bases de datos

## Comportamiento de referencia

La documentación pública de Notion presenta una base de datos como una colección de páginas: cada elemento es una página propia, puede abrirse, formatearse y anidarse. Una misma fuente admite varias vistas y una vista enlazada reutiliza los datos con configuración local.

Fuentes: [Intro to databases](https://www.notion.com/help/intro-to-databases) y [linked views](https://www.notion.com/help/notion-academy/lesson/linked-views).

## Brecha de CrewSync

CrewSync no tiene un módulo dedicado de bases de datos genéricas. Sus datos tipados (`projects`, `tasks`, `pages`) tienen pantallas específicas y no deben convertirse automáticamente en una tabla genérica sin una decisión de producto.

## Evidencia autenticada REA

La sesión observada contiene una base llamada `REMEXPERIENCE`, con una vista `Vista de tablero` y tarjetas que enlazan a páginas individuales. La vista expone estados con conteos (`Sin empezar`, `backlog`, `En curso`, `ACCESOS & INFO`, `Listo`) y controles `Filtrar`, `Ordenar`, `Buscar`, `Nuevo`, `Agregar una vista` y `Configuración`. Ver [evidencia de runtime](runtime-evidence.md) y los `evidence_id` allí registrados.

### Evidencia de fila como página

La inspección de una tarjeta confirma que una fila del board se abre como página propia en un panel lateral, con opción de abrirla como página completa. En el panel se muestran propiedades (`Estado`, `Asignar`), la acción `Add a property` y comentarios con adjuntos y menciones. La evidencia completa, URL y límites están en la sección [Flujo observado de una tarjeta](runtime-evidence.md#flujo-observado-de-una-tarjeta).

Para CrewSync, esto sugiere que una fila no debe modelarse solo como una celda del tablero: debe conservar una identidad de página, una ruta de edición rápida y una ruta de edición completa, ambas sometidas a las mismas policies/scopes.

## Modelo mínimo recomendado

| Entidad | Responsabilidad |
|---|---|
| `databases` | nombre, workspace, página contenedora, propietario y visibilidad |
| `database_properties` | nombre, tipo, configuración, posición y archivado |
| `database_rows` | página/registro, título, posición y estado |
| `database_values` | valor tipado por propiedad y fila |
| `database_views` | fuente, tipo de vista, filtros, orden, agrupación y configuración local |

Antes de migrar tablas existentes, decidir si tareas/proyectos serán fuentes nativas o si solo se ofrecerán bases personalizadas. Reutilizar policies/scopes y no permitir que una vista salte el workspace activo.

## Tipos de propiedad iniciales

`title`, `text`, `number`, `select`, `multi_select`, `date`, `person`, `checkbox`, `url`, `relation` y `rollup` (este último después de relaciones estables).

## Aceptación propuesta

- Crear una base en una página visible y añadir filas que abran una página editable.
- Crear dos vistas sobre la misma fuente; cambiar filtro/orden en una no cambia la otra.
- Eliminar o archivar una propiedad no borra silenciosamente valores sin confirmación.
- Las filas, relaciones y personas se validan dentro del workspace autorizado.
- Un índice de bases nunca devuelve registros fuera de `visibleForUser`.
