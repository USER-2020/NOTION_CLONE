<?php

namespace App\Notifications;

use App\Models\Comment;
use App\Models\Task;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Str;

class TaskCommentNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly Task $task,
        private readonly Comment $comment,
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
        $subject = 'Nuevo comentario en una '.$taskLabel;

        return (new MailMessage)
            ->subject($subject)
            ->view('emails.brand-notification', [
                'subject' => $subject,
                'eyebrow' => 'Comentario nuevo',
                'title' => 'Hay una nueva actualizacion en la tarea',
                'recipientName' => $notifiable->name,
                'intro' => "{$this->actor->name} dejo un comentario en esta {$taskLabel}. Puedes abrirla en el dashboard para seguir la conversacion completa.",
                'highlight' => Str::limit($this->comment->body, 180),
                'details' => [
                    'Proyecto' => $this->task->project?->name ?? 'Sin proyecto',
                    'Tipo' => ucfirst($taskLabel),
                    'Tarea' => $this->task->title,
                    'Comento' => $this->actor->name,
                ],
                'ctaLabel' => 'Ver comentario',
                'ctaUrl' => $this->taskUrl(),
                'outro' => 'Entra al dashboard para responder, revisar responsables y mantener el seguimiento del proyecto al dia.',
            ]);
    }

    private function taskUrl(): string
    {
        return route('tasks.index', [
            'project_id' => $this->task->project_id,
            'task_id' => $this->task->parent_id ?: $this->task->id,
        ]);
    }
}
