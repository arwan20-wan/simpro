<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DailyReport extends Model
{
    protected $fillable = [
        'project_id',
        'user_id',
        'report_date',
        'work_description',
        'jenis',
        'weather',
        'manpower',
        'progress_percent',
        'notes',
    ];

    protected $casts = [
        'report_date' => 'date',
        'manpower' => 'integer',
        'progress_percent' => 'integer',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function photos(): HasMany
    {
        return $this->hasMany(ProjectPhoto::class);
    }
}
