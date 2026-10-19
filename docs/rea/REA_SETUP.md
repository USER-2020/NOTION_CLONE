# REA — estado de conexión y procedimiento

## Estado en esta sesión

El CLI de REA quedó instalado y registrado para Codex durante esta sesión:

- CLI: `rea-agents` 6.7.0, instalado globalmente en `C:\Users\Juan Zuluaga\AppData\Roaming\npm\node_modules\rea-agents`.
- Registro Codex: aplicado en `C:\Users\Juan Zuluaga\.codex\config.toml` y apuntando a la instalación global, no a `node_modules` del repositorio.
- Skill REA: instalada en `C:\Users\Juan Zuluaga\.agents\skills\reverse-engineer-anything`, versión 42.
- `rea doctor --client codex --json`: registro alineado y CLI operativo.
- Proveedores opcionales nativos (Ghidra, IDA, JADX, Kuna): ausentes. No son necesarios para el análisis JavaScript solicitado.

Se ejecutó el analizador JavaScript sobre una selección de `resources/js`. REA generó evidencia estática con el identificador:

`ev_616329c963c75a285910b716c828b97f8a155b4a18735f257005e864e29c2eba`

La evidencia incluye inventario de archivos, grafo y selección reproducible, pero el análisis semántico quedó limitado por el self-test nativo de Windows:

`REA Windows native self-test failed: Open Windows path component failed [C:\\Users\\JUANZU~1] (Win32 5): Acceso denegado.`

Por tanto, este repositorio documenta REA como evidencia de inventario/análisis parcial, no como observación autenticada de una sesión de Notion. Las conclusiones sobre el producto Notion se basan en documentación pública oficial y están separadas de la evidencia local.

La dependencia global no está declarada en `package.json` ni forma parte del artefacto de CrewSync. Si se reinstala Windows o cambia el perfil de usuario, repetir la instalación global y el registro de Codex.

## Procedimiento oficial

La documentación oficial de `morluto/rea` indica que el setup guiado para Codex es:

```powershell
npx rea-agents@latest setup
```

Para diagnosticar una instalación existente:

```powershell
rea doctor --json
rea doctor --client codex --json
rea setup --client codex --dry-run --json
```

La documentación oficial también describe el análisis estático puntual sin depender de herramientas MCP:

```powershell
npx -y rea-agents@latest analyze-javascript-application "C:\ruta\a\NOTION_CLONE" --json
```

Referencia oficial: [morluto/rea — instalación](https://github.com/morluto/rea/blob/main/docs/installation.md).

## Instalación local en Windows para este equipo

Esta es la ruta que se aplicó en el PC de desarrollo. La instalación es local al perfil de Windows; no añade REA a `package.json`, no modifica `node_modules` del repositorio y no debe subirse al repo.

### 1. Requisitos

- Windows PowerShell.
- Node.js compatible con REA: Node 22.x (>=22.19), 24.x (>=24.11) o 26+.
- npm disponible en `PATH`.
- Codex instalado y reiniciado después de cambiar su configuración.

Comprobar el entorno:

```powershell
node --version
npm --version
```

### 2. Instalar el CLI global

Para tener el comando `rea` disponible desde cualquier terminal:

```powershell
npm install --global rea-agents
rea --version
```

En algunas instalaciones de PowerShell la política de ejecución bloquea el wrapper `rea.ps1`. Si aparece `PSSecurityException`, usa el wrapper `.cmd`, que no requiere cambiar la política global:

```powershell
rea.cmd --version
rea.cmd doctor --client codex --json
```

También puedes usar `npx -y rea-agents@latest ...` para una ejecución puntual. No es necesario ejecutar `Set-ExecutionPolicy` para usar REA.

La instalación global es opcional. Para una ejecución puntual sin instalarlo globalmente se puede usar:

```powershell
npx -y rea-agents@latest doctor --json
```

No uses `npm install rea-agents` sin `--global` esperando un comando global: eso solo deja el ejecutable dentro del proyecto.

### 3. Registrar REA en Codex

Ejecutar primero un plan de solo lectura:

```powershell
rea setup --client codex --dry-run --json
```

Si el plan muestra únicamente el registro esperado para Codex, aplicarlo:

```powershell
rea setup --client codex --yes --format json
```

El registro queda en la configuración personal de Codex, normalmente:

`C:\Users\<usuario>\.codex\config.toml`

La skill de REA queda fuera del repositorio, bajo el perfil personal de agentes. La configuración persistente puede apuntar a una versión exacta de `rea-agents`; por eso no se debe editar manualmente para apuntar a una carpeta temporal de `npx`.

### 4. Verificar la instalación

```powershell
rea doctor --client codex --json
rea doctor --skill --json
```

Hay dos resultados distintos que no deben confundirse:

- `registration: aligned` significa que Codex tiene el registro de REA correcto.
- `environment_healthy: false` puede reflejar proveedores opcionales ausentes o un self-test nativo de Windows; no implica que las herramientas web/CDP de REA estén inutilizables.

Después de un setup correcto, reinicia Codex. En VS Code, `Developer: Reload Window` puede refrescar la sesión, pero si REA no aparece en la lista MCP, cierra y vuelve a abrir VS Code/Codex por completo.

### 5. Conectar una página web autenticada (Notion)

REA no inicia sesión por ti. Abre un Chrome separado con depuración CDP y un perfil temporal:

```powershell
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$profile = Join-Path $env:TEMP "rea-notion-profile"
Start-Process -FilePath $chrome -ArgumentList @(
  "--remote-debugging-port=9222",
  "--user-data-dir=$profile",
  "https://app.notion.com"
)
```

Inicia sesión manualmente en ese Chrome. Luego el agente puede:

1. listar targets con `list_browser_targets` usando `http://127.0.0.1:9222` y `allowed_origins: ["https://app.notion.com"]`;
2. inspeccionar sin mutar con `inspect_web_page`;
3. ejecutar únicamente recorridos declarados y preferentemente de solo lectura con `capture_browser_scenario`.

El puerto `9222` y el perfil temporal deben mantenerse abiertos mientras se captura evidencia. Cerrar Chrome termina esa conexión, pero no desinstala REA.

### 6. Estado aplicado en este equipo

- Versión observada: `rea-agents` 6.7.0.
- Instalación global: `C:\Users\Juan Zuluaga\AppData\Roaming\npm\node_modules\rea-agents`.
- Servidor MCP local registrado para Codex.
- Chrome CDP utilizado para Notion: `http://127.0.0.1:9222`.
- Documentación de runtime: [`notion/runtime-evidence.md`](notion/runtime-evidence.md).
- No hay dependencia REA en el proyecto ni archivo de credenciales en `docs/`.

### 7. Actualizar o desinstalar

Actualizar la instalación global y volver a revisar el plan:

```powershell
rea update
rea setup --client codex --dry-run --json
```

Quitar solo los registros y skills administrados por REA:

```powershell
rea uninstall
```

`rea uninstall --purge-data` también elimina la caché/estado de REA. No lo ejecutes si quieres conservar evidencias o capturas locales.

## Continuación recomendada para CrewSync

El siguiente trabajo ya no es instalar REA. Es convertir la evidencia en decisiones de producto, en este orden:

1. Comparar el tablero `REMEXPERIENCE` observado con el board de tareas de CrewSync.
2. Definir el contrato mínimo de una base genérica: fuente, propiedades, filas/páginas y vistas.
3. Implementar primero una vista board estable sobre datos autorizados, manteniendo `visibleForUser`, policies y `current_workspace_id`.
4. Añadir búsqueda contextual y filtros por propiedad antes de abordar Timeline, Gallery o Chart.
5. Probar compartir/permisos en CrewSync sin permitir que la UI sustituya la autorización del backend.
6. Repetir una captura REA después de cada cambio importante y registrar el `evidence_id` en `docs/rea/notion/runtime-evidence.md`.

No empieces todavía por automatizaciones, IA, relaciones/rollups o paridad completa del editor. Primero cierra el recorrido mínimo: página → base → vista → filtro/orden → permisos → recarga.

## Qué debe verificarse después de conectar

1. Que el servidor REA figure entre las herramientas MCP del agente.
2. Que una llamada de análisis devuelva un registro de evidencia, no solo un mensaje de instalación.
3. Que los resultados puedan guardarse sin sobrescribir el core en `docs/rea/notion/`.
4. Que cada observación indique método, estado de acceso, límites y evidencia.

## Alcance inicial solicitado

Después de la reconexión, investigar primero:

- editor de bloques;
- bases de datos dinámicas;
- comportamiento observable de sus vistas, filtros, propiedades y relaciones.

No realizar cambios destructivos ni copiar código, assets o branding propietario de Notion.
