<?php

namespace App\Http\Controllers\Api\PJ;

use App\Http\Controllers\Controller;
use App\Models\DailyReport;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $projects = Project::query()
            ->where('pj_user_id', $user->id)
            ->withCount(['dailyReports'])
            ->with(['dailyReports' => function ($query) {
                $query->orderBy('report_date', 'desc')->limit(1);
            }])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function (Project $project) {
                $latestReport = $project->dailyReports->first();
                return [
                    'id' => $project->id,
                    'code' => $project->code,
                    'name' => $project->name,
                    'client_name' => $project->client_name,
                    'location' => $project->location,
                    'start_date' => $project->start_date,
                    'end_date' => $project->end_date,
                    'budget' => $project->budget,
                    'daily_reports_count' => $project->daily_reports_count ?? 0,
                    'progress' => $project->progress,
                    'status' => $project->status,
                    'last_report_date' => $latestReport?->report_date,
                    'created_at' => $project->created_at,
                ];
            });

        return response()->json([
            'message' => 'Data proyek berhasil diambil.',
            'data' => $projects,
        ]);
    }

    public function summary(Request $request): JsonResponse
    {
        $user = $request->user();
        $today = now()->startOfDay();
        $monthStart = now()->startOfMonth();

        $baseQuery = DailyReport::query()
            ->whereHas('project', function ($query) use ($user) {
                $query->where('pj_user_id', $user->id);
            });

        $reportsToday = (clone $baseQuery)
            ->whereDate('report_date', $today)
            ->count();

        $reportsThisMonth = (clone $baseQuery)
            ->whereBetween('report_date', [$monthStart, $today])
            ->count();

        $reportsTotal = $baseQuery->count();

        return response()->json([
            'message' => 'Ringkasan laporan berhasil diambil.',
            'data' => [
                'today' => $reportsToday,
                'month' => $reportsThisMonth,
                'total' => $reportsTotal,
            ],
        ]);
    }

    public function responsiblePeople(): JsonResponse
    {
        $responsiblePeople = User::query()
            ->where('role', 'pj_konstruksi')
            ->where('position', 'Penanggung Jawab')
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return response()->json([
            'message' => 'Data penanggung jawab berhasil diambil.',
            'data' => $responsiblePeople,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'unique:projects'],
            'name' => ['required', 'string'],
            'client_name' => ['nullable', 'string'],
            'location' => ['nullable', 'string'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date'],
            'budget' => ['nullable', 'numeric', 'min:0'],
        ]);

        $project = Project::create([
            ...$validated,
            'pj_user_id' => $request->user()->id,
            'created_by' => $request->user()->id,
            'progress' => 0,
            'status' => 'planned',
        ]);

        return response()->json([
            'message' => 'Proyek berhasil ditambahkan.',
            'data' => $project,
        ], 201);
    }

    public function show(Request $request, Project $project): JsonResponse
    {
        $this->authorize('view', $project);

        $project->load([
            'dailyReports' => function ($query) {
                $query->orderBy('report_date', 'desc');
            },
            'dailyReports.photos',
            'dailyReports.user',
            'monthlyReports',
            'photos',
        ]);

        return response()->json([
            'message' => 'Detail proyek berhasil diambil.',
            'data' => $project,
        ]);
    }

    public function update(Request $request, Project $project): JsonResponse
    {
        $this->authorize('update', $project);

        $validated = $request->validate([
            'name' => ['sometimes', 'string'],
            'client_name' => ['sometimes', 'nullable', 'string'],
            'location' => ['sometimes', 'nullable', 'string'],
            'start_date' => ['sometimes', 'nullable', 'date'],
            'end_date' => ['sometimes', 'nullable', 'date'],
            'budget' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'progress' => ['sometimes', 'integer', 'min:0', 'max:100'],
            'status' => ['sometimes', 'in:planned,running,delayed,completed'],
        ]);

        $project->update($validated);

        return response()->json([
            'message' => 'Proyek berhasil diperbarui.',
            'data' => $project,
        ]);
    }

    public function destroy(Request $request, Project $project): JsonResponse
    {
        $this->authorize('delete', $project);

        $project->delete();

        return response()->json([
            'message' => 'Proyek berhasil dihapus.',
        ]);
    }
}
