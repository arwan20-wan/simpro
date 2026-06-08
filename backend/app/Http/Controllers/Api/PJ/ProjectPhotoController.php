<?php

namespace App\Http\Controllers\Api\PJ;

use App\Http\Controllers\Controller;
use App\Models\DailyReport;
use App\Models\Project;
use App\Models\ProjectPhoto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProjectPhotoController extends Controller
{
    public function store(Request $request, Project $project, DailyReport $dailyReport): JsonResponse
    {
        $this->authorize('view', $project);

        if ($dailyReport->project_id !== $project->id) {
            return response()->json([
                'message' => 'Laporan tidak ditemukan untuk proyek ini.',
            ], 404);
        }

        $validated = $request->validate([
            'photo' => ['required', 'image', 'mimes:jpeg,png,jpg,gif', 'max:5120'],
            'caption' => ['nullable', 'string'],
        ]);

        $file = $request->file('photo');
        $path = $file->store('project-photos/' . $project->id . '/' . $dailyReport->id, 'public');

        $photo = ProjectPhoto::create([
            'project_id' => $project->id,
            'daily_report_id' => $dailyReport->id,
            'uploaded_by' => $request->user()->id,
            'file_path' => $path,
            'caption' => $validated['caption'] ?? null,
            'taken_at' => now(),
        ]);

        return response()->json([
            'message' => 'Foto berhasil diunggah.',
            'data' => [
                'id' => $photo->id,
                'file_path' => $photo->file_path,
                'url' => Storage::url($photo->file_path),
                'caption' => $photo->caption,
                'created_at' => $photo->created_at,
            ],
        ], 201);
    }

    public function destroy(Request $request, Project $project, ProjectPhoto $photo): JsonResponse
    {
        $this->authorize('delete', $photo);

        if ($photo->project_id !== $project->id) {
            return response()->json([
                'message' => 'Foto tidak ditemukan untuk proyek ini.',
            ], 404);
        }

        $deletePath = $photo->file_path;

        if (Str::startsWith($deletePath, ['http://', 'https://'])) {
            $deletePath = parse_url($deletePath, PHP_URL_PATH) ?: $deletePath;
        }

        $deletePath = ltrim($deletePath, '/');
        Storage::disk('public')->delete($deletePath);
        $photo->delete();

        return response()->json([
            'message' => 'Foto berhasil dihapus.',
        ]);
    }
}
