<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminLoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_login_and_receive_token(): void
    {
        User::factory()->create([
            'name' => 'Administrator SIMPRO',
            'username' => 'admin',
            'email' => 'admin@simpro.local',
            'role' => 'admin',
            'password' => Hash::make('admin12345'),
        ]);

        $response = $this->postJson('/api/admin/login', [
            'username' => 'admin',
            'password' => 'admin12345',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('user.role', 'admin')
            ->assertJsonStructure(['token', 'token_type', 'user' => ['id', 'username', 'role']]);
    }

    public function test_non_admin_user_cannot_login_to_admin_endpoint(): void
    {
        User::factory()->create([
            'username' => 'pj001',
            'role' => 'pj_konstruksi',
            'password' => Hash::make('password'),
        ]);

        $response = $this->postJson('/api/admin/login', [
            'username' => 'pj001',
            'password' => 'password',
        ]);

        $response->assertUnprocessable();
    }
}
