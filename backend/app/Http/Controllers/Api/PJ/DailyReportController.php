<?php

namespace App\Http\Controllers\Api\PJ;

use App\Http\Controllers\Controller;
use App\Models\DailyReport;
use App\Models\ProjectPhoto;
use Illuminate\Support\Facades\Storage;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DailyReportController extends Controller
{
    public function index(Request $request, Project $project): JsonResponse
    {
        $this->authorize('view', $project);

        $reports = $project->dailyReports()
            ->with(['user', 'photos'])
            ->orderBy('report_date', 'desc')
            ->get();

        return response()->json([
            'message' => 'Data laporan harian berhasil diambil.',
            'data' => $reports,
        ]);
    }

    public function store(Request $request, Project $project): JsonResponse
    {
        $this->authorize('create', [DailyReport::class, $project]);

        $validated = $request->validate([
            'report_date' => ['required', 'date'],
            'work_description' => ['required', 'string'],
            'jenis' => ['required', 'string', 'in:Harian,Mingguan,Bulanan'],
            'weather' => ['nullable', 'string'],
            'manpower' => ['nullable', 'integer', 'min:0'],
            'progress_percent' => ['nullable', 'integer', 'min:0', 'max:100'],
            'notes' => ['nullable', 'string'],
            'photos' => ['nullable', 'array'],
            'photos.*' => ['file', 'mimes:jpg,jpeg,png,gif,webp', 'max:5120'],
        ]);

        $report = $project->dailyReports()->create([
            ...$validated,
            'user_id' => $request->user()->id,
        ]);

        if (isset($validated['progress_percent'])) {
            $project->update([
                'progress' => $validated['progress_percent'],
                'status' => $validated['progress_percent'] === 100 ? 'completed' : 'running',
            ]);
        }

        // Handle uploaded photos (if any)
        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $file) {
                $path = $file->store('project_photos', 'public');

                ProjectPhoto::create([
                    'project_id' => $project->id,
                    'daily_report_id' => $report->id,
                    'uploaded_by' => $request->user()->id,
                    'file_path' => $path,
                ]);
            }
            // reload photos relationship
            $report->load('photos');
        }

        return response()->json([
            'message' => 'Laporan harian berhasil ditambahkan.',
            'data' => $report,
        ], 201);
    }

    public function show(Request $request, Project $project, DailyReport $dailyReport): JsonResponse
    {
        $this->authorize('view', $project);

        if ($dailyReport->project_id !== $project->id) {
            return response()->json([
                'message' => 'Laporan tidak ditemukan untuk proyek ini.',
            ], 404);
        }

        $dailyReport->load(['user', 'photos']);

        return response()->json([
            'message' => 'Detail laporan harian berhasil diambil.',
            'data' => $dailyReport,
        ]);
    }

    public function update(Request $request, Project $project, DailyReport $dailyReport): JsonResponse
    {
        $this->authorize('update', $dailyReport);

        if ($dailyReport->project_id !== $project->id) {
            return response()->json([
                'message' => 'Laporan tidak ditemukan untuk proyek ini.',
            ], 404);
        }

        $validated = $request->validate([
            'report_date' => ['sometimes', 'date'],
            'work_description' => ['sometimes', 'string'],
            'jenis' => ['sometimes', 'string', 'in:Harian,Mingguan,Bulanan'],
            'weather' => ['sometimes', 'nullable', 'string'],
            'manpower' => ['sometimes', 'integer', 'min:0'],
            'progress_percent' => ['sometimes', 'integer', 'min:0', 'max:100'],
        ]);

        $dailyReport->update($validated);

        if (array_key_exists('progress_percent', $validated)) {
            $project->update([
                'progress' => $validated['progress_percent'],
                'status' => $validated['progress_percent'] === 100 ? 'completed' : 'running',
            ]);
        }

        return response()->json([
            'message' => 'Laporan harian berhasil diperbarui.',
            'data' => $dailyReport,
        ]);
    }

    public function destroy(Request $request, Project $project, DailyReport $dailyReport): JsonResponse
    {
        $this->authorize('delete', $dailyReport);

        if ($dailyReport->project_id !== $project->id) {
            return response()->json([
                'message' => 'Laporan tidak ditemukan untuk proyek ini.',
            ], 404);
        }

        $dailyReport->delete();

        return response()->json([
            'message' => 'Laporan harian berhasil dihapus.',
        ]);
    }
}
