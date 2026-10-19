# CrewSync 2.0 — paquete de traspaso para otro agente

Este archivo es el punto de entrada para continuar el trabajo sin reconstruir el contexto.

## Skill local

La politica de correo local y la activacion de SMTP real estan en [`references/email-notifications.md`](notion-clone-context/references/email-notifications.md).

La skill reutilizable está en [`docs/notion-clone-context/SKILL.md`](notion-clone-context/SKILL.md). Su metadata UI está en [`docs/notion-clone-context/agents/openai.yaml`](notion-clone-context/agents/openai.yaml).

Antes de tocar código, leer en este orden:

1. [`audit/CREWSYNC_CORE.md`](audit/CREWSYNC_CORE.md): auditoría del estado real del core.
2. [`notion-clone-context/references/overview.md`](notion-clone-context/references/overview.md): stack, arranque y convenciones.
3. [`notion-clone-context/references/modules.md`](notion-clone-context/references/modules.md): rutas y módulos.
4. [`notion-clone-context/references/data-and-security.md`](notion-clone-context/references/data-and-security.md): relaciones, scopes, roles y límites.
5. [`notion-clone-context/references/frontend-and-testing.md`](notion-clone-context/references/frontend-and-testing.md): contratos UI, build y pruebas.

## Investigación y plan

- Estado REA: [`rea/REA_SETUP.md`](rea/REA_SETUP.md).
- Documentación modular de referencia: [`rea/notion/README.md`](rea/notion/README.md).
- Matriz de paridad: [`rea/NOTION_FEATURE_MATRIX.md`](rea/NOTION_FEATURE_MATRIX.md).
- Brechas: [`rea/CREWSYNC_GAP_ANALYSIS.md`](rea/CREWSYNC_GAP_ANALYSIS.md).
- Plan de implementación: [`rea/FEATURE_IMPLEMENTATION_PLAN.md`](rea/FEATURE_IMPLEMENTATION_PLAN.md).

## Verificación realizada

- `php artisan test`: 53 pruebas, 156 aserciones, todas exitosas.
- `npm run build`: exitoso; PWA generada.
- `php artisan route:list --except-vendor`: 54 rutas.
- Se ajustó `tests/Feature/ExampleTest.php` para reflejar que `/` redirige legítimamente a `/dashboard`.
- REA permanece instalado localmente en el PC, fuera de las dependencias del repositorio; Codex apunta a su instalación global.

## Estado de producto

El core funcional cubre autenticación, workspaces, proyectos, tareas/subtareas, comentarios, adjuntos, páginas, permisos y PWA. Siguen siendo brechas principales el editor por bloques completo, bases de datos/vistas genéricas, búsqueda global y colaboración avanzada. No implementar esas brechas antes de fijar contratos, migraciones, policies y pruebas.

## Regla de evidencia

Separar siempre: (a) comportamiento observado en CrewSync, (b) documentación pública de Notion y (c) decisión de producto. La evidencia REA disponible es estática/parcial y no es una sesión autenticada de Notion.
