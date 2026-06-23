<?php

namespace App\Notifications;

use App\Models\Task;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TaskStatusChangedNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly Task $task,
        private readonly User $actor,
        private readonly string $fromStatus,
        private readonly string $toStatus,
    ) {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $taskLabel = $this->task->parent_id ? 'subtarea' : 'tarea';
        $subject = 'Actualización de estado en una '.$taskLabel;

        return (new MailMessage)
            ->subject($subject)
            ->view('emails.brand-notification', [
                'subject' => $subject,
                'eyebrow' => 'Cambio de estado',
                'title' => 'La tarea tuvo una actualización',
                'recipientName' => $notifiable->name,
                'intro' => "{$this->actor->name} actualizó el estado de esta {$taskLabel}. Puedes abrirla desde el tablero para revisar qué cambió.",
                'highlight' => $this->task->title,
                'details' => [
                    'Proyecto' => $this->task->project?->name ?? 'Sin proyecto',
                    'Tipo' => ucfirst($taskLabel),
                    'Estado anterior' => $this->statusLabel($this->fromStatus),
                    'Estado nuevo' => $this->statusLabel($this->toStatus),
                ],
                'ctaLabel' => 'Ver en dashboard',
                'ctaUrl' => $this->taskUrl(),
                'outro' => 'Revisa el contexto completo dentro de la plataforma y continúa con el siguiente paso del flujo.',
            ]);
    }

    private function statusLabel(string $status): string
    {
        return [
            'backlog' => 'Pendiente',
            'todo' => 'Por hacer',
            'in_progress' => 'En progreso',
            'review' => 'En revisión',
            'done' => 'Hecha',
            'blocked' => 'Bloqueada',
        ][$status] ?? $status;
    }

    private function taskUrl(): string
    {
        return route('tasks.index', [
            'project_id' => $this->task->project_id,
            'task_id' => $this->task->parent_id ?: $this->task->id,
        ]);
    }
}
