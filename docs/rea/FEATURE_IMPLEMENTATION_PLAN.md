# Plan de implementación funcional

## Gate 0 — REA y evidencia

- [x] Conectar REA al cliente Codex y registrar la skill.
- [ ] Obtener evidencia semántica autenticada de editor de bloques y bases de datos; el self-test nativo de Windows quedó bloqueado.
- [x] Guardar documentación modular y límites en `docs/rea/notion/`.
- [x] Actualizar la matriz de paridad; las afirmaciones siguen separadas de la evidencia pública.

## Gate 1 — contratos

- [x] Seleccionar una primera vertical de extremo a extremo: vistas guardadas del tablero de tareas.
- [x] Definir entidad `task_views`, filtros soportados, permisos por propietario/workspace y criterios de aceptación.
- [x] Revisar migraciones y compatibilidad con el workspace activo y `visibleForUser`.

## Gate 2 — implementación

- [x] Migración incremental y modelo/relaciones para `task_views`.
- [x] Validaciones de nombre, tipo, filtros y pertenencia al workspace.
- [x] Policy de edición/eliminación por propietario.
- [x] Controller, rutas y props Inertia.
- [x] Controles React para guardar, cargar y eliminar vistas del tablero.
- [x] Pruebas de autorización, persistencia y regresión (`TaskSavedViewsTest`).

## Gate 3 — paridad y CrewSync

- [ ] Verificar interacciones y estados contra requisitos observados.
- [ ] Registrar diferencias deliberadas.
- [ ] Añadir capacidades propias: dependencias, hitos, calendario global, timeline, métricas y My Work.

## Gate 4 — Deluxe

- [ ] Iniciar rediseño visual solo cuando las verticales incluidas estén verificadas.
- [ ] Ejecutar QA responsive, PWA, rendimiento y permisos.
