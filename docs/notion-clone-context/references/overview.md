# Panorama de la aplicación

## Propósito actual

NOTION_CLONE es un workspace privado tipo Notion para organizar espacios de trabajo, proyectos, tareas y páginas internas. Incluye colaboración básica mediante asignaciones, comentarios, adjuntos, notificaciones y control de acceso basado en roles.

## Stack y ejecución

- Backend: Laravel 10, PHP 8.2, Breeze, Sanctum e Inertia Laravel.
- Frontend: React 18, Inertia React, Tailwind 3, Vite, `@dnd-kit` y `react-hot-toast`.
- Autorización: Spatie Laravel Permission.
- Desarrollo: SQLite; compatible con MySQL/MariaDB.
- PWA: `vite-plugin-pwa`; la configuración está en `vite.config.js` y genera archivos en `public/`.

Comandos usuales:

```powershell
composer install --no-security-blocking
npm install
php artisan key:generate
php artisan migrate:fresh --seed
npm run dev
php artisan test
```

Para comprobar producción del frontend, usa `npm run build`. Para los archivos públicos almacenados en disco `public`, Laravel requiere el enlace de almacenamiento habitual (`php artisan storage:link`) cuando el entorno aún no lo tenga.

## Estructura relevante

```text
app/
  Http/Controllers/      Casos de uso HTTP/Inertia
  Http/Requests/         Validación y reglas de pertenencia
  Models/                Eloquent, relaciones y scopes de visibilidad
  Policies/              Autorización por recurso
  Notifications/         Correos de tareas y bienvenida
database/
  migrations/            Esquema del producto
  seeders/               Roles, permisos y datos de ejemplo
resources/js/
  Pages/                 Pantallas Inertia por módulo
  Components/            Controles reutilizables
  Layouts/               Shell autenticado y de invitados
routes/web.php           Superficie principal autenticada
tests/Feature/           Protección de flujos críticos
```

## Flujo HTTP/Inertia

Las rutas web llaman controllers que autorizan con policies, consultan solo recursos visibles y renderizan una página React de `resources/js/Pages`. Los formularios se envían con `useForm` o `router` de Inertia; las respuestas suelen volver a la misma página con flashes `success`/`error`.

`HandleInertiaRequests` expone globalmente:

- `auth.user`, `auth.permissions` y `auth.roles`.
- `workspace.current` y `workspace.available`.
- `flash.success` y `flash.error`.

El layout autenticado decide la navegación según permisos, persiste el estado colapsado del sidebar en `localStorage` y actualiza la preferencia visual vía `PATCH profile.theme`.

## Convenciones del repositorio

- Idioma de la interfaz y mensajes: español. Identificadores de código y tablas: inglés.
- La aplicación raíz está en este repositorio; no usar `_scaffold` si existe.
- Los slugs se derivan del nombre/título y se hacen únicos en los controllers; los proyectos son únicos por workspace en la base y las páginas tienen una restricción `workspace_id + slug`.
- Los archivos se almacenan en el disco `public` y se serializan con `Storage::disk(...)->url(...)`.
- Las reglas locales de intervención están en `CODEX.md`: parche mínimo, sin dependencias ni refactors globales no solicitados.
