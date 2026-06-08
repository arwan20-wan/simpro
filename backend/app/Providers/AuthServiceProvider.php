<?php

namespace App\Providers;

use App\Models\DailyReport;
use App\Models\Project;
use App\Models\ProjectPhoto;
use App\Policies\DailyReportPolicy;
use App\Policies\ProjectPhotoPolicy;
use App\Policies\ProjectPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Project::class => ProjectPolicy::class,
        DailyReport::class => DailyReportPolicy::class,
        ProjectPhoto::class => ProjectPhotoPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        //
    }
}
