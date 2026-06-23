<?php

namespace App\Notifications;

use App\Models\Task;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TaskAssignedNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly Task $task,
        private readonly User $actor,
    ) {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $taskLabel = $this->task->parent_id ? 'subtarea' : 'tarea';
        $subject = 'Se te asignó una nueva '.$taskLabel;

        return (new MailMessage)
            ->subject($subject)
            ->view('emails.brand-notification', [
                'subject' => $subject,
                'eyebrow' => 'Asignación de tarea',
                'title' => 'Tienes trabajo nuevo asignado',
                'recipientName' => $notifiable->name,
                'intro' => "{$this->actor->name} te asignó una {$taskLabel} dentro del dashboard. Ya puedes abrirla y revisar el detalle completo.",
                'highlight' => $this->task->title,
                'details' => [
                    'Proyecto' => $this->task->project?->name ?? 'Sin proyecto',
                    'Tipo' => ucfirst($taskLabel),
                    'Estado actual' => $this->statusLabel($this->task->status),
                    'Prioridad' => $this->priorityLabel($this->task->priority),
                ],
                'ctaLabel' => 'Abrir tarea',
                'ctaUrl' => $this->taskUrl(),
                'outro' => 'Entra al dashboard para ver comentarios, responsables, subtareas y próximos pasos.',
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

    private function priorityLabel(string $priority): string
    {
        return [
            'low' => 'Baja',
            'medium' => 'Media',
            'high' => 'Alta',
            'urgent' => 'Urgente',
        ][$priority] ?? $priority;
    }

    private function taskUrl(): string
    {
        return route('tasks.index', [
            'project_id' => $this->task->project_id,
            'task_id' => $this->task->parent_id ?: $this->task->id,
        ]);
    }
}
