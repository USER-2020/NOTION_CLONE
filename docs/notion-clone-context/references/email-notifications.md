# Correo y notificaciones

## Política del entorno local

El repositorio usa por defecto un entorno local con Mailpit como referencia, pero no se debe asumir que Mailpit está ejecutándose. Para evitar que una tarea falle por un SMTP inexistente, el entorno local mantiene:

```env
MAIL_MAILER=smtp
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_NOTIFICATIONS_ENABLED=false
```

Con `MAIL_NOTIFICATIONS_ENABLED=false`:

- Laravel cambia el mailer efectivo a `array`, por lo que no abre conexiones SMTP.
- Las notificaciones de bienvenida, asignación, cambio de estado y comentarios se omiten.
- Crear, editar, guardar y mover tareas continúa funcionando normalmente.
- La solicitud manual de verificación de correo devuelve el estado `email-notifications-disabled` en lugar de intentar enviar.
- No se envía ningún correo externo; el usuario debe ver la actividad dentro de la aplicación.

El archivo `.env` es local y no se versiona. `.env.example` documenta la misma política para instalaciones nuevas.

## Activar un proveedor real

Solo se debe activar el correo cuando exista un proveedor SMTP/API válido y accesible:

```env
MAIL_NOTIFICATIONS_ENABLED=true
MAIL_MAILER=smtp
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USERNAME=usuario-smtp
MAIL_PASSWORD=secreto-smtp
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=notificaciones@example.com
MAIL_FROM_NAME="${APP_NAME}"
```

Después de cambiar variables de entorno, limpiar la configuración cargada:

```powershell
php artisan config:clear
```

En producción se puede volver a cachear cuando los valores estén confirmados:

```powershell
php artisan config:cache
```

No se debe usar `MAIL_NOTIFICATIONS_ENABLED=true` con `hello@example.com`, `mailpit`, `localhost` o un host no accesible.

## Implementación

- `config/mail.php` selecciona `array` como mailer efectivo cuando el flag está desactivado.
- `App\Notifications\MailNotifications` centraliza la decisión y reconoce remitentes de ejemplo y hosts locales no disponibles.
- Las notificaciones propias (`TaskAssignedNotification`, `TaskStatusChangedNotification`, `TaskCommentNotification` y `MemberWelcomeNotification`) devuelven un canal vacío cuando el correo está deshabilitado.
- `EmailVerificationNotificationController` evita el envío manual cuando el flag está apagado.

## Pruebas y diagnóstico

Las pruebas se ejecutan con `APP_ENV=testing` y conservan las notificaciones falsas para poder verificar los contratos sin enviar correos reales:

```powershell
php artisan test tests/Feature/TaskAndMemberNotificationTest.php
```

Para comprobar el estado efectivo del entorno local:

```powershell
php artisan tinker --execute='var_dump(\App\Notifications\MailNotifications::enabled());'
```

Con la configuración local anterior debe devolver `bool(false)`. Si aparece `TransportException` al guardar una tarea, revisar `MAIL_NOTIFICATIONS_ENABLED`, limpiar la configuración y confirmar que no exista un `config` cacheado con valores anteriores.
