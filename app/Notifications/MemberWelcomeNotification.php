<?php

namespace App\Notifications;

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class MemberWelcomeNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly Workspace $workspace,
        private readonly string $password,
        private readonly string $role,
        private readonly User $createdBy,
    ) {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $subject = 'Tu acceso a SmartSend ya está listo';

        return (new MailMessage)
            ->subject($subject)
            ->view('emails.brand-notification', [
                'subject' => $subject,
                'eyebrow' => 'Nuevo acceso',
                'title' => 'Tu cuenta fue creada',
                'recipientName' => $notifiable->name,
                'intro' => 'Ya tienes acceso a la plataforma. Te compartimos los datos iniciales para que puedas ingresar y empezar a trabajar.',
                'highlight' => 'Acceso preparado para SmartSend Prestige Studio',
                'details' => [
                    'Espacio asignado' => $this->workspace->name,
                    'Rol asignado' => $this->roleLabel($this->role),
                    'Correo de acceso' => $notifiable->email,
                    'Contraseña temporal' => $this->password,
                    'Creado por' => $this->createdBy->name,
                ],
                'ctaLabel' => 'Ir al login',
                'ctaUrl' => route('login'),
                'outro' => 'Te recomendamos cambiar tu contraseña apenas ingreses para mantener tu cuenta segura.',
            ]);
    }

    private function roleLabel(string $role): string
    {
        return [
            'admin' => 'Administrador',
            'project_manager' => 'Gestor de proyectos',
            'member' => 'Miembro',
            'viewer' => 'Visualizador',
        ][$role] ?? $role;
    }
}
