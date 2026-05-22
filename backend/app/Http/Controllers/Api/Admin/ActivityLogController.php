<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->ensureAdmin($request);

        $logs = AdminActivityLog::query()
            ->with(['admin:id,name,username', 'targetUser:id,name,username'])
            ->latest()
            ->limit(100)
            ->get()
            ->map(fn (AdminActivityLog $log) => [
                'id' => $log->id,
                'type' => $log->type,
                'title' => $log->title,
                'desc' => $log->description,
                'admin_name' => $log->admin?->name ?? 'Admin',
                'target_name' => $log->targetUser?->name ?? ($log->metadata['target_name'] ?? '-'),
                'target_employee_id' => $log->targetUser?->username ?? ($log->metadata['target_employee_id'] ?? null),
                'time' => $log->created_at?->diffForHumans(),
                'tanggal' => $log->created_at?->translatedFormat('d M Y, H:i'),
            ]);

        return response()->json([
            'data' => $logs,
        ]);
    }

    private function ensureAdmin(Request $request): void
    {
        abort_if($request->user()?->role !== 'admin', 403, 'Hanya Admin yang boleh mengakses riwayat aktivitas.');
    }
}
