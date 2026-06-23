# Notion Clone

Laravel 10 + Breeze + Inertia React starter for a secure Notion-style workspace app with projects, tasks, and internal pages.

## Stack

- Laravel 10 / PHP 8.2
- Breeze with Inertia + React
- Tailwind CSS + Vite
- Spatie Laravel Permission
- SQLite for local verification, compatible with MySQL/MariaDB for app use

## Current Scope

- Authenticated-only app shell with dashboard, projects, tasks, and pages
- Role and permission seeding for `super_admin`, `admin`, `project_manager`, `member`, and `viewer`
- Backend authorization through policies and visibility scopes
- Workspace, project, task, page, block, attachment, comment, label, and activity schema
- Project, task, and page CRUD foundations through Inertia routes/controllers
- Seeded demo workspace with sample users, project, tasks, and page blocks

## Install

```bash
composer install --no-security-blocking
npm install
php artisan key:generate
```

For a quick local SQLite run:

```bash
touch database/database.sqlite
php artisan migrate:fresh --seed
npm run build
php artisan serve
```

For MySQL or MariaDB, update `.env` first and then run:

```bash
php artisan migrate --seed
```

## Seeded Accounts

- `admin@notion-clone.test`
- `manager@notion-clone.test`
- `member@notion-clone.test`

Default password for seeded factory users:

```text
password
```

## Verified

- `php artisan route:list`
- `php artisan test tests/Feature/AuthorizationFlowTest.php`
- `npm run build`
- `php artisan migrate:fresh --seed` using SQLite

## Notes

- The active application lives at the repository root.
- `_scaffold` is a failed temporary scaffold from the first install attempt on Windows and can be ignored.
