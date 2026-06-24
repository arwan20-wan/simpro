<?php

namespace App\Http\Controllers\Api\GM;

use App\Http\Controllers\Controller;
use App\Models\DailyReport;
use App\Models\FinancialTransaction;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ReportController extends Controller
{
    public function dashboard(Request $request): JsonResponse
    {
        $this->ensureGeneralManager($request);

        $projectQuery = Project::query()
            ->with('pjUser:id,name')
            ->whereHas('creator', fn ($query) => $query->where('role', 'pj_konstruksi'));

        $projects = (clone $projectQuery)
            ->withSum([
                'financialTransactions as used_budget' => fn ($query) => $query->where('type', 'expense'),
            ], 'amount')
            ->orderByDesc('budget')
            ->get();

        $projectIds = $projects->pluck('id');
        $totalProjects = $projects->count();
        $activeProjects = $projects->whereIn('status', ['planned', 'running', 'delayed'])->count();
        $averageProgress = $totalProjects > 0 ? round((float) $projects->avg('progress'), 1) : 0;
        $totalBudget = (float) $projects->sum(fn (Project $project) => (float) $project->budget);
        $totalUsed = (float) $projects->sum(fn (Project $project) => (float) ($project->used_budget ?? 0));
        $totalReports = DailyReport::query()
            ->whereIn('project_id', $projectIds)
            ->count();

        $statusCounts = $projects
            ->groupBy('status')
            ->map(fn ($items) => $items->count());

        return response()->json([
            'data' => [
                'summary' => [
                    'total_projects' => $totalProjects,
                    'active_projects' => $activeProjects,
                    'average_progress' => $averageProgress,
                    'total_budget' => $totalBudget,
                    'total_used' => $totalUsed,
                    'total_reports' => $totalReports,
                    'status_counts' => [
                        'planned' => $statusCounts->get('planned', 0),
                        'running' => $statusCounts->get('running', 0),
                        'delayed' => $statusCounts->get('delayed', 0),
                        'completed' => $statusCounts->get('completed', 0),
                    ],
                ],
                'projects' => $projects->map(fn (Project $project) => [
                    'id' => $project->id,
                    'name' => $project->name,
                    'location' => $project->location,
                    'pj' => $project->pjUser?->name ?? '-',
                    'budget' => (float) $project->budget,
                    'used' => (float) ($project->used_budget ?? 0),
                    'remaining' => max((float) $project->budget - (float) ($project->used_budget ?? 0), 0),
                    'progress' => (int) $project->progress,
                    'status' => $project->status,
                ])->values(),
            ],
        ]);
    }

    public function projects(Request $request): JsonResponse
    {
        $this->ensureGeneralManager($request);

        $projects = Project::query()
            ->with('pjUser:id,name')
            ->whereHas('creator', fn ($query) => $query->where('role', 'pj_konstruksi'))
            ->orderBy('name')
            ->get()
            ->map(fn (Project $project) => [
                'id' => $project->id,
                'name' => $project->name,
                'location' => $project->location,
                'pj' => $project->pjUser?->name ?? '-',
            ]);

        return response()->json(['data' => $projects]);
    }

    public function dailyReports(Request $request): JsonResponse
    {
        $this->ensureGeneralManager($request);

        $jenis = $request->query('jenis', 'Harian');

        $reports = DailyReport::query()
            ->with(['project.pjUser:id,name', 'photos'])
            ->whereHas('project.creator', fn ($query) => $query->where('role', 'pj_konstruksi'))
            ->when($jenis, fn ($query) => $query->where('jenis', $jenis))
            ->orderBy('report_date', 'desc')
            ->get()
            ->map(fn (DailyReport $report) => [
                'id' => $report->id,
                'project_id' => $report->project_id,
                'project_name' => $report->project?->name ?? '-',
                'location' => $report->project?->location,
                'pj' => $report->project?->pjUser?->name ?? '-',
                'jenis' => $report->jenis,
                'report_date' => $report->report_date?->toDateString(),
                'work_description' => $report->work_description,
                'weather' => $report->weather,
                'manpower' => $report->manpower,
                'progress_percent' => $report->progress_percent,
                'notes' => $report->notes,
                'photo_count' => $report->photos->count(),
            ]);

        return response()->json(['data' => $reports]);
    }

    public function financialReports(Request $request): JsonResponse
    {
        $this->ensureGeneralManager($request);

        $transactions = FinancialTransaction::query()
            ->with('project.pjUser:id,name')
            ->whereHas('project.creator', fn ($query) => $query->where('role', 'pj_konstruksi'))
            ->orderBy('transaction_date', 'desc')
            ->get()
            ->map(fn (FinancialTransaction $transaction) => [
                'id' => $transaction->id,
                'project_id' => $transaction->project_id,
                'project_name' => $transaction->project?->name ?? '-',
                'location' => $transaction->project?->location,
                'pj' => $transaction->project?->pjUser?->name ?? '-',
                'transaction_date' => $transaction->transaction_date?->toDateString(),
                'category' => $transaction->category,
                'has_receipt' => (bool) $transaction->receipt_path,
                'download_url' => url("/api/gm/reports/finance/{$transaction->id}/download"),
            ]);

        return response()->json(['data' => $transactions]);
    }

    public function downloadFinancialReport(Request $request, FinancialTransaction $transaction)
    {
        $this->ensureGeneralManager($request);

        if (! $transaction->receipt_path || ! Storage::disk('public')->exists($transaction->receipt_path)) {
            return response()->json(['message' => 'File laporan keuangan tidak ditemukan.'], 404);
        }

        return response()->download(Storage::disk('public')->path($transaction->receipt_path));
    }

    private function ensureGeneralManager(Request $request): void
    {
        abort_if($request->user()?->role !== 'general_manager', 403, 'Akses hanya untuk General Manager.');
    }
}
