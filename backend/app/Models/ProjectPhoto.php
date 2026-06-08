<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProjectPhoto extends Model
{
    protected $fillable = [
        'project_id',
        'daily_report_id',
        'uploaded_by',
        'file_path',
        'caption',
        'taken_at',
    ];

    protected $appends = ['url'];

    public function getUrlAttribute(): string
    {
        if (!$this->file_path) {
            return '';
        }

        if (Str::startsWith($this->file_path, ['http://', 'https://'])) {
            return $this->file_path;
        }

        return Storage::url($this->file_path);
    }

    protected $casts = [
        'taken_at' => 'datetime',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function dailyReport(): BelongsTo
    {
        return $this->belongsTo(DailyReport::class);
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
