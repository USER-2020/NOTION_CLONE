# Evidencia REA en tiempo de ejecución de Notion

Esta página registra únicamente observaciones hechas sobre una sesión autenticada de Notion mediante REA/CDP. No es documentación de API ni una afirmación de paridad con CrewSync.

## Sesión observada

- Navegador: Chrome 155.0.8059.80.
- Origen aprobado: `https://app.notion.com`.
- Página inicial: `FLUJO DE FUNDACIONES`.
- Evidencia de descubrimiento: `ev_57799ca9bd725e76af6fc6f84e61de86d598a9742f95f717069d74d801acf4a9`.
- Evidencia de inspección inicial: `ev_a654dffeb509dc567e26fb8eaa399c4812f3940bd3a5d26cda599a69ed958efa`.

La sesión quedó conectada a un Chrome externo mediante CDP. REA no guardó credenciales, cookies, cuerpos de red ni valores de almacenamiento.

## Página y navegación

La página de contenido observada expone:

- Sidebar con páginas compartidas y privadas, espacios de equipo, `Nueva página`, favoritos, configuración del espacio, biblioteca y navegación `Inicio / Chatear / Reuniones`.
- Acciones de página `Compartir`, `Copiar enlace`, `Favoritos`, `Acciones`, `Agregar un ícono` y `Personalizar diseño`.
- Propiedades de página como tabla editable: `Estado`, `Asignar` y `Add a property`.
- La página inspeccionada indicaba que era visible para cualquier persona con el enlace.

## Base de datos observada: REMEXPERIENCE

Al seleccionar `REMEXPERIENCE` desde el sidebar, la URL cambió a una vista de base de datos:

`https://app.notion.com/p/32d25def730980ef9ebbfe7134e3c589?v=32d25def730980f6af9a000cbd924972`

Evidencia de navegación controlada: `ev_017039f5cf65b77870f407501da4715c3ffe2acb6faa317fbdb4545a47db37d5`.

La inspección de la vista (`ev_fa8bb61df397a445c35f574c1ce9b060c516977379c73d03e1289d9af0101c92`) mostró:

- Vista seleccionada: `Vista de tablero`.
- Columnas/agrupaciones visibles: `Sin empezar` (14), `backlog` (7), `En curso` (16), `ACCESOS & INFO` (2) y `Listo` (0).
- Tarjetas como enlaces a páginas individuales, con comentarios y acciones contextuales.
- Controles de vista: `Filtrar`, `Ordenar`, `Buscar`, `Nuevo`, `Más opciones para añadir` y `Agregar una vista`.
- Acciones adicionales visibles en el estado estable: `Automatizaciones`, `Autocompletado con IA` y `Configuración`.

## Menús de vista

Al abrir el menú de `Vista de tablero`, REA observó (`ev_0b7ac607aa8cb355585697e642fd24c96d7b09e020b822e038efdbbbd4b22c`):

- `Cambiar nombre`.
- `Mostrar como`.
- `Editar vista`.
- `Origen REMEXPERIENCE` (deshabilitado).
- `Copiar enlace de la vista`.
- `Agregar vista a la barra lateral` (deshabilitado).
- `Duplicar vista`.

El submenú `Mostrar como` (`ev_af929304e9de56ede14594eb7b275c871850c15b5f5cfb9f149c76d108b20c8a`) ofreció `Texto e ícono`, `Solo texto` y `Solo ícono`, con la nota `Solo se aplica a ti`.

## Búsqueda dentro de la base

La acción controlada `Buscar` (`ev_d1356f3b5d6372a8061b6e9c708751d73413c266a54f2201fbba2e1a172f66d6`) añadió el textbox `Escribe para buscar…` sin cambiar la URL. Esto confirma búsqueda contextual de la vista, separada del control global `Buscar o preguntar` del sidebar.

## Compartición y permisos observados

El diálogo `Compartir` de `REMEXPERIENCE` (`ev_45811c6ddcf5d32c9af272a6b0475823b2e325e51a6f02dab293d59c1d463176`) mostró:

- Pestañas `Compartir` y `Publicar`.
- Campo para invitar correos o grupos.
- Dos colaboradores visibles con `Acceso completo`.
- Acceso general configurado como `Cualquier usuario de la web que tenga el enlace` con permiso `Puede editar`.
- Acciones `Avanzado`, `Copiar enlace` y `Descartar`.
- Enlace a la ayuda oficial de compartir y permisos.

No se modificó ningún permiso; la captura fue solo lectura.

## Flujo observado de una tarjeta

La evidencia `ev_71b557e8b4bfd4e48d8ae575c86e6f54806f0eeae404d00d4720dcc70a3aae08` documenta la apertura, en modo solo lectura, de la tarjeta `ORGANIZAR OPENDECKS PLATAFROMA DE LEARNING` desde el tablero `REMEXPERIENCE`.

- La tarjeta se representa como un enlace a una página de la base de datos.
- Al seleccionarla, Notion abre una ventana lateral y conserva el contexto del tablero. La URL añade los parámetros `p` (página/registro) y `pm=s` (modo lateral) sin abandonar la base.
- La ventana lateral ofrece `Cerrar`, `Abrir como página completa`, `Cambiar modo de visualización`, `Copiar enlace` y `Favoritos`.
- La sección `Propiedades de la página` expone las propiedades `Estado` y `Asignar`, junto con `Add a property`.
- La misma superficie incluye comentarios con campo `Agregar un comentario…`, adjuntar archivo, mencionar una persona/página/fecha y enviar comentario.
- También aparece el affordance `crea una plantilla` para una página vacía.

La apertura no cambió columnas, conteos, propiedades ni permisos. Esto respalda un patrón de producto de **edición rápida en panel lateral + edición completa como página**, pero no demuestra que una mutación se haya ejecutado.

### Límites de esta inspección

Se intentó abrir el selector de `Estado` en la evidencia `ev_4ef81cc5a37dc14cb0f74c065c744c460fda93d5a501eba12a625d7ecfaab56d`, pero la acción fue cancelada por una condición de tiempo del panel CDP. Por tanto, las opciones concretas del selector, sus colores y la persistencia del cambio siguen sin estar observadas y no deben inferirse.

## Límites de interpretación

- La evidencia es de una cuenta y workspace concretos; no representa todos los planes ni configuraciones de Notion.
- Las capturas de escenario se marcaron `controlled-replay`; las inspecciones pasivas se marcaron `external-service`.
- La captura de navegación inicial tuvo eventos de red limitados por presupuesto, pero los artefactos de accesibilidad y URL de cada paso quedaron completos.
- Los nombres, conteos y permisos son datos observados en ese momento y pueden cambiar.
- Las capacidades no observadas (por ejemplo, edición efectiva de una fila, cambio de propiedad, opciones concretas del selector de estado o creación efectiva) permanecen desconocidas.

## Cómo reproducir

1. Iniciar el Chrome de depuración usado por REA en el puerto `9222`.
2. Iniciar sesión manualmente en `https://app.notion.com`.
3. Listar targets con `list_browser_targets` restringiendo `allowed_origins` a `https://app.notion.com`.
4. Ejecutar `inspect_web_page` para observación pasiva o `capture_browser_scenario` para una acción declarada y de solo lectura.
5. Registrar el `evidence_id`, la URL y las limitaciones junto con cualquier conclusión.

## Observación adicional: canvas lateral estable

En una nueva inspección de la misma base se obtuvo `ev_ba9f84099ecf55777f3e3772fdb66cf53d4760b14e07149d37ae5123aa25f613`. La captura controlada con espera de estado estable se registró como `ev_858edf4ae8ec03876dd672bd7bb70032525ea507da2bdaceaa758aa63c362fe6`.

La evidencia confirma estos affordances del canvas lateral:

- El detalle aparece como una región accesible `Ventana lateral` sin abandonar la vista de tablero.
- La página conserva un editor enriquecido editable y una tabla de propiedades.
- El encabezado ofrece `Cerrar`, `Abrir como página completa`, `Compartir`, `Copiar enlace` y `Acciones`.
- La URL mantiene la base y usa `p` para el registro abierto y `pm=s` para el modo lateral.

La captura fue pasiva/controlada y no ejecutó una mutación de datos. Por eso la persistencia del cambio en Notion sigue siendo una hipótesis de producto, no una observación de red.
