<?php

namespace App\Notifications;

final class MailNotifications
{
    public static function enabled(): bool
    {
        if (app()->environment('testing')) {
            return true;
        }

        $configured = config('mail.notifications_enabled');

        if ($configured === false) {
            return false;
        }

        if ($configured === true) {
            return true;
        }

        if (config('mail.default') !== 'smtp') {
            return false;
        }

        $host = strtolower(trim((string) config('mail.mailers.smtp.host')));
        $from = strtolower(trim((string) config('mail.from.address')));

        if (! filter_var($from, FILTER_VALIDATE_EMAIL) || in_array($from, ['hello@example.com', 'test@example.com'], true)) {
            return false;
        }

        return $host !== '' && ! in_array($host, ['mailpit', 'localhost', '127.0.0.1', '::1'], true);
    }
}
