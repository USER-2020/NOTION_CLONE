<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Collection;

class Workspace extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'logo_path',
        'owner_id',
        'settings',
    ];

    protected $casts = [
        'settings' => 'array',
    ];

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'workspace_user')
            ->withPivot(['role', 'joined_at'])
            ->withTimestamps();
    }

    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }

    public function pages(): HasMany
    {
        return $this->hasMany(Page::class);
    }

    public function labels(): HasMany
    {
        return $this->hasMany(Label::class);
    }

    public function scopeVisibleForUser(Builder $query, User $user): Builder
    {
        if ($user->hasAnyRole(['super_admin', 'admin'])) {
            return $query;
        }

        return $query->where(function (Builder $builder) use ($user) {
            $builder
                ->where('owner_id', $user->id)
                ->orWhereHas('users', fn (Builder $users) => $users->where('users.id', $user->id));
        });
    }

    public static function currentForUser(User $user, mixed $workspaceId = null): ?self
    {
        $visible = static::query()->visibleForUser($user)->orderBy('name');

        if (filled($workspaceId)) {
            $selected = (clone $visible)->find((int) $workspaceId);

            if ($selected) {
                return $selected;
            }
        }

        return $visible->first();
    }

    public static function optionsForUser(User $user): Collection
    {
        return static::query()
            ->visibleForUser($user)
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'logo_path']);
    }
}
