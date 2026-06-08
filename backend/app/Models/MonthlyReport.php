<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MonthlyReport extends Model
{
    protected $fillable = [
        'project_id',
        'user_id',
        'month',
        'year',
        'summary',
        'progress_percent',
    ];

    protected $casts = [
        'month' => 'integer',
        'year' => 'integer',
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
}
