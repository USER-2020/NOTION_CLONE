# Editor por bloques

## Evidencia y certeza

- **Notion**: la documentación pública describe páginas cuyos elementos pueden abrirse como páginas y organizarse con contenido anidado; no sustituye una inspección de sesión.
- **CrewSync**: `PageController` conserva el cuerpo editable en el primer bloque `paragraph` con `content_json.text`. `RichTextEditor` produce HTML mediante `contentEditable`; puede subir imágenes cuando recibe un endpoint autorizado.
- **REA**: el inventario estático confirma la superficie React seleccionada, pero el self-test nativo de Windows impidió completar el análisis semántico. Ver `../REA_SETUP.md`.

## Contrato observado de CrewSync

| Elemento | Estado actual | Riesgo al extender |
|---|---|---|
| Página | Implementada, con slug y relación opcional a workspace/proyecto | Mantener visibilidad y compatibilidad de slugs |
| Bloque | Modelo y policy existentes; uso funcional centrado en `paragraph` | No introducir una columna paralela al cuerpo |
| Editor | HTML básico en `contentEditable` | Normalizar sanitización y estados de guardado |
| Imagen | Adjunta a tarea cuando existe `imageUploadUrl` | No habilitar subida sin recurso padre y policy |
| Anidación | Página padre compatible por workspace/proyecto | Validar ciclos y pertenencia antes de persistir |

## Requisitos para paridad funcional

1. Definir un esquema de bloques versionado: `type`, `content_json`, `position`, `parent_id` o equivalente.
2. Mantener migración desde el primer `paragraph` actual sin pérdida de HTML.
3. Cubrir tipos mínimos antes de añadir formatos deluxe: párrafo, encabezado, lista, checklist, cita, divisor y enlace.
4. Persistir por operaciones pequeñas y reordenables, con validación de autorización por página.
5. Sanitizar HTML/URLs y limitar cargas a endpoints con policy y límites de tamaño existentes.

## Aceptación propuesta

- Editar y recargar conserva exactamente el contenido y orden de bloques.
- Crear, duplicar, mover y borrar un bloque no modifica páginas de otro workspace.
- Un usuario sin `pages.edit` puede leer, pero no puede mutar por request manual.
- La migración de una página existente mantiene su texto y enlaces.
