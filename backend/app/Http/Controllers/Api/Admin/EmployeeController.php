<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminActivityLog;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class EmployeeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->ensureAdmin($request);

        $employees = User::query()
            ->whereIn('role', ['pj_konstruksi', 'general_manager'])
            ->latest()
            ->get()
            ->map(fn (User $user) => $this->employeePayload($user));

        return response()->json([
            'data' => $employees,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $this->ensureAdmin($request);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:30'],
            'position' => ['required', Rule::in(['Penanggung Jawab', 'General Manager'])],
            'address' => ['nullable', 'string'],
            'is_active' => ['required', 'boolean'],
        ]);

        $role = $this->roleFromPosition($data['position']);

        $user = User::query()->create([
            'name' => $data['name'],
            'username' => $this->generateEmployeeId($role),
            'email' => $data['email'] ?? null,
            'phone' => $data['phone'] ?? null,
            'position' => $data['position'],
            'address' => $data['address'] ?? null,
            'role' => $role,
            'is_active' => $data['is_active'],
            'password' => Hash::make('123456'),
        ]);

        $this->recordActivity($request, 'tambah', $user);

        return response()->json([
            'message' => 'Karyawan berhasil ditambahkan. Gunakan ID karyawan sebagai username dan password awal 123456.',
            'data' => $this->employeePayload($user),
        ], 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $this->ensureAdmin($request);
        $this->ensureEmployee($user);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'phone' => ['nullable', 'string', 'max:30'],
            'position' => ['required', Rule::in(['Penanggung Jawab', 'General Manager'])],
            'address' => ['nullable', 'string'],
            'is_active' => ['required', 'boolean'],
        ]);

        $previousData = [
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'position' => $user->position,
            'address' => $user->address,
            'is_active' => $user->is_active,
        ];

        $user->update([
            'name' => $data['name'],
            'email' => $data['email'] ?? null,
            'phone' => $data['phone'] ?? null,
            'position' => $data['position'],
            'address' => $data['address'] ?? null,
            'role' => $this->roleFromPosition($data['position']),
            'is_active' => $data['is_active'],
        ]);

        $this->recordActivity($request, 'edit', $user->refresh(), [
            'before' => $previousData,
        ]);

        return response()->json([
            'message' => 'Data karyawan berhasil diupdate.',
            'data' => $this->employeePayload($user),
        ]);
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        $this->ensureAdmin($request);
        $this->ensureEmployee($user);

        $deletedEmployee = [
            'id' => $user->id,
            'name' => $user->name,
            'employee_id' => $user->username,
            'position' => $user->position,
        ];

        $user->delete();

        $this->recordActivity($request, 'hapus', null, [
            'deleted_employee' => $deletedEmployee,
            'target_name' => $deletedEmployee['name'],
            'target_employee_id' => $deletedEmployee['employee_id'],
        ]);

        return response()->json([
            'message' => 'Data karyawan berhasil dihapus.',
        ]);
    }

    private function ensureAdmin(Request $request): void
    {
        abort_if($request->user()?->role !== 'admin', 403, 'Hanya Admin yang boleh mengakses data karyawan.');
    }

    private function ensureEmployee(User $user): void
    {
        abort_if(! in_array($user->role, ['pj_konstruksi', 'general_manager'], true), 404);
    }

    private function generateEmployeeId(string $role): string
    {
        $prefix = $role === 'general_manager' ? 'GM' : 'PJ';
        $year = now()->year;
        $pattern = $prefix.'-'.$year.'-%';

        $lastUsername = User::query()
            ->where('username', 'like', $pattern)
            ->orderByDesc('username')
            ->value('username');

        $lastNumber = $lastUsername ? (int) substr($lastUsername, -3) : 0;

        return sprintf('%s-%d-%03d', $prefix, $year, $lastNumber + 1);
    }

    private function roleFromPosition(string $position): string
    {
        return $position === 'General Manager' ? 'general_manager' : 'pj_konstruksi';
    }

    private function recordActivity(Request $request, string $type, ?User $targetUser, array $metadata = []): void
    {
        $targetName = $targetUser?->name ?? ($metadata['target_name'] ?? '-');
        $targetEmployeeId = $targetUser?->username ?? ($metadata['target_employee_id'] ?? null);
        $position = $targetUser?->position ?? ($metadata['deleted_employee']['position'] ?? null);

        $action = match ($type) {
            'tambah' => 'menambahkan',
            'edit' => 'mengubah',
            'hapus' => 'menghapus',
            default => 'memproses',
        };

        AdminActivityLog::query()->create([
            'admin_user_id' => $request->user()?->id,
            'target_user_id' => $targetUser?->id,
            'type' => $type,
            'title' => match ($type) {
                'tambah' => 'Tambah data karyawan',
                'edit' => 'Edit data karyawan',
                'hapus' => 'Hapus data karyawan',
                default => 'Aktivitas admin',
            },
            'description' => sprintf(
                '%s %s data karyawan %s%s.',
                $request->user()?->name ?? 'Admin',
                $action,
                $targetName,
                $targetEmployeeId ? " ({$targetEmployeeId})" : ''
            ),
            'metadata' => array_merge($metadata, [
                'target_name' => $targetName,
                'target_employee_id' => $targetEmployeeId,
                'position' => $position,
            ]),
        ]);
    }

    private function employeePayload(User $user): array
    {
        return [
            'id' => $user->id,
            'employee_id' => $user->username,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'position' => $user->position,
            'role' => $user->role,
            'address' => $user->address,
            'status' => $user->is_active ? 'Aktif' : 'Nonaktif',
            'is_active' => $user->is_active,
            'joined_at' => $user->created_at?->translatedFormat('d M Y'),
        ];
    }
}
