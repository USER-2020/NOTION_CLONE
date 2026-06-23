# CODEX.md — Reglas de trabajo para NOTION_CLONE

## 1. Contexto del proyecto

Este proyecto es una aplicación tipo Notion construida con:

- Laravel 10
- PHP 8.2
- Breeze
- Inertia + React
- Tailwind CSS
- Vite
- Spatie Laravel Permission
- SQLite para desarrollo local
- Compatible con MySQL/MariaDB

La aplicación tiene como objetivo ser un workspace privado donde usuarios autenticados puedan gestionar:

- Workspaces
- Projects
- Tasks
- Pages
- Blocks
- Attachments
- Comments
- Labels
- Activity logs

El sistema maneja roles y permisos con Spatie:

- super_admin
- admin
- project_manager
- member
- viewer

## 2. Prioridad principal

Trabajar siempre en modo parche mínimo.

Antes de modificar código:

- Entender el objetivo exacto.
- Revisar solo los archivos necesarios.
- Evitar exploración completa del repositorio.
- No hacer refactors globales.
- No cambiar arquitectura sin autorización.
- No instalar dependencias nuevas sin aprobación.
- No tocar archivos no relacionados con la tarea.

## 3. Reglas para ahorrar tokens

Cuando trabajes en este repositorio:

- No expliques conceptos básicos de Laravel, React, Inertia o Tailwind.
- No repitas código completo si solo cambias una parte.
- No listes archivos que no fueron tocados.
- No generes documentación larga salvo que se pida.
- No hagas análisis general del proyecto salvo que se pida.
- No abras todo el repo para tareas pequeñas.
- Busca por nombres concretos de clases, rutas, componentes o controladores.
- Entrega respuestas cortas, directas y accionables.

Formato de respuesta por defecto:

1. Archivos modificados
2. Cambios realizados
3. Comandos para probar
4. Notas importantes si aplica

## 4. Estructura esperada del proyecto

Respetar la estructura Laravel/Inertia existente:

```txt
app/
  Http/
    Controllers/
    Requests/
  Models/
  Policies/

database/
  migrations/
  seeders/
  factories/

resources/
  js/
    Components/
    Layouts/
    Pages/
  views/

routes/
  web.php
  auth.php

tests/
  Feature/
  Unit/