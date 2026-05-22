<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ApiToken;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
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

        $user = User::query()
            ->where('username', $credentials['username'])
            ->orWhere('email', $credentials['username'])
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

        $user = User::query()
            ->where('username', $credentials['username'])
            ->orWhere('email', $credentials['username'])
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

    private function userPayload(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'username' => $user->username,
            'email' => $user->email,
            'role' => $user->role,
            'position' => $user->position,
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
