<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ApiToken;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $inputUsername = trim($credentials['username']);

        $user = User::query()
            ->whereRaw('LOWER(username) = ?', [strtolower($inputUsername)])
            ->orWhereRaw('LOWER(email) = ?', [strtolower($inputUsername)])
            ->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'username' => ['Username atau password tidak sesuai.'],
            ]);
        }

        if (! $user->is_active) {
            throw ValidationException::withMessages([
                'username' => ['Akun tidak aktif. Hubungi admin sistem.'],
            ]);
        }

        return response()->json([
            'message' => 'Login berhasil.',
            'token' => $this->createToken($user),
            'token_type' => 'Bearer',
            'user' => $this->userPayload($user),
            'redirect_to' => $this->redirectPath($user->role),
        ]);
    }

    public function loginAdmin(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $inputUsername = trim($credentials['username']);

        $user = User::query()
            ->whereRaw('LOWER(username) = ?', [strtolower($inputUsername)])
            ->orWhereRaw('LOWER(email) = ?', [strtolower($inputUsername)])
            ->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'username' => ['Username atau password tidak sesuai.'],
            ]);
        }

        if (! $user->is_active) {
            throw ValidationException::withMessages([
                'username' => ['Akun tidak aktif. Hubungi admin sistem.'],
            ]);
        }

        if ($user->role !== 'admin') {
            throw ValidationException::withMessages([
                'username' => ['Akun ini bukan akun Admin.'],
            ]);
        }

        return response()->json([
            'message' => 'Login admin berhasil.',
            'token' => $this->createToken($user),
            'token_type' => 'Bearer',
            'user' => $this->userPayload($user),
            'redirect_to' => '/dashboard/admin',
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $this->userPayload($request->user()),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->attributes->get('api_token')?->delete();

        return response()->json([
            'message' => 'Logout berhasil.',
        ]);
    }

    public function updateProfilePhoto(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'profile_photo' => ['required', 'image', 'mimes:jpg,jpeg,png,gif,webp', 'max:5120'],
        ]);

        $user = $request->user();
        $oldPath = $user->profile_photo_path;
        $path = $validated['profile_photo']->store('profile-photos', 'public');

        $user->update([
            'profile_photo_path' => $path,
        ]);

        if ($oldPath && $oldPath !== $path) {
            Storage::disk('public')->delete($oldPath);
        }

        return response()->json([
            'message' => 'Foto profil berhasil diperbarui.',
            'user' => $this->userPayload($user->refresh()),
        ]);
    }

    private function userPayload(User $user): array
    {
        $profilePhotoUrl = $user->profile_photo_path
            ? Storage::disk('public')->url($user->profile_photo_path)
            : null;

        return [
            'id' => $user->id,
            'name' => $user->name,
            'username' => $user->username,
            'email' => $user->email,
            'role' => $user->role,
            'position' => $user->position,
            'phone' => $user->phone,
            'address' => $user->address,
            'birth_date' => $user->birth_date?->toDateString(),
            'profile_photo_url' => $profilePhotoUrl,
        ];
    }

    private function createToken(User $user): string
    {
        $plainToken = Str::random(80);

        ApiToken::query()->create([
            'user_id' => $user->id,
            'name' => $user->role.'-login',
            'token' => hash('sha256', $plainToken),
            'abilities' => [$user->role],
        ]);

        return $plainToken;
    }

    private function redirectPath(string $role): string
    {
        return match ($role) {
            'admin' => '/dashboard/admin',
            'general_manager' => '/dashboard/gm',
            default => '/dashboard/pj',
        };
    }
}
