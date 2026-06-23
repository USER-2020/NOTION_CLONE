<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Page extends Model
{
    use HasFactory;

    protected $fillable = [
        'workspace_id',
        'project_id',
        'parent_id',
        'title',
        'slug',
        'excerpt',
        'is_favorite',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'is_favorite' => 'boolean',
    ];

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Page::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Page::class, 'parent_id');
    }

    public function blocks(): HasMany
    {
        return $this->hasMany(Block::class)->orderBy('position');
    }

    public function comments(): MorphMany
    {
        return $this->morphMany(Comment::class, 'commentable');
    }

    public function attachments(): MorphMany
    {
        return $this->morphMany(Attachment::class, 'attachable');
    }

    public function scopeVisibleForUser(Builder $query, User $user): Builder
    {
        return $query->where(function (Builder $builder) use ($user) {
            $builder
                ->whereHas('workspace', fn (Builder $workspace) => $workspace->visibleForUser($user))
                ->where(function (Builder $nested) use ($user) {
                    $nested
                        ->whereNull('project_id')
                        ->orWhereHas('project', fn (Builder $project) => $project->visibleForUser($user));
                });
        });
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
