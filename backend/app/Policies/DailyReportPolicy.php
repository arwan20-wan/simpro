<?php

namespace App\Policies;

use App\Models\DailyReport;
use App\Models\Project;
use App\Models\User;

class DailyReportPolicy
{
    public function create(User $user, Project $project): bool
    {
        return $project->pj_user_id === $user->id;
    }

    public function update(User $user, DailyReport $report): bool
    {
        return $report->user_id === $user->id || $report->project->pj_user_id === $user->id;
    }

    public function delete(User $user, DailyReport $report): bool
    {
        return $report->user_id === $user->id || $report->project->pj_user_id === $user->id;
    }
}
