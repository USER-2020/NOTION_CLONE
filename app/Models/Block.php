<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Block extends Model
{
    use HasFactory;

    protected $fillable = [
        'page_id',
        'parent_id',
        'type',
        'content_json',
        'position',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'content_json' => 'array',
    ];

    public function page(): BelongsTo
    {
        return $this->belongsTo(Page::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Block::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Block::class, 'parent_id')->orderBy('position');
    }
}
