<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'workspace_id',
        'name',
        'slug',
        'description',
        'status',
        'priority',
        'start_date',
        'due_date',
        'owner_id',
        'icon',
        'color',
        'is_favorite',
    ];

    protected $casts = [
        'start_date' => 'date',
        'due_date' => 'date',
        'is_favorite' => 'boolean',
    ];

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class)
            ->withPivot(['role'])
            ->withTimestamps();
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    public function pages(): HasMany
    {
        return $this->hasMany(Page::class);
    }

    public function scopeVisibleForUser(Builder $query, User $user): Builder
    {
        if ($user->hasAnyRole(['super_admin', 'admin'])) {
            return $query;
        }

        return $query->where(function (Builder $builder) use ($user) {
            $builder
                ->where('owner_id', $user->id)
                ->orWhereHas('members', fn (Builder $members) => $members->where('users.id', $user->id))
                ->orWhereHas('workspace', fn (Builder $workspace) => $workspace->whereHas(
                    'users',
                    fn (Builder $users) => $users->where('users.id', $user->id)
                ));
        });
    }
}
