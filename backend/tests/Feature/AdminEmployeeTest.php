<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminEmployeeTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_employee_account_that_can_login(): void
    {
        User::factory()->create([
            'username' => 'admin',
            'role' => 'admin',
            'password' => Hash::make('admin12345'),
        ]);

        $token = $this->postJson('/api/login', [
            'username' => 'admin',
            'password' => 'admin12345',
        ])->json('token');

        $employee = $this
            ->withToken($token)
            ->postJson('/api/admin/employees', [
                'name' => 'Ahmad Fauzi',
                'email' => 'ahmad.fauzi@simpro.id',
                'phone' => '081234567890',
                'position' => 'Penanggung Jawab',
                'address' => 'Jakarta',
                'is_active' => true,
            ])
            ->assertCreated()
            ->assertJsonPath('data.employee_id', 'PJ-2026-001')
            ->json('data');

        $this
            ->postJson('/api/login', [
                'username' => $employee['employee_id'],
                'password' => '123456',
            ])
            ->assertOk()
            ->assertJsonPath('user.role', 'pj_konstruksi')
            ->assertJsonPath('redirect_to', '/dashboard/pj');
    }
}
