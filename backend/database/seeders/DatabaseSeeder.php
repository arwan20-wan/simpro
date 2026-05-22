<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        DB::table('users')->updateOrInsert([
            'username' => 'admin',
        ], [
            'name' => 'Administrator SIMPRO',
            'email' => 'admin@simpro.local',
            'role' => 'admin',
            'position' => 'Admin Sistem',
            'is_active' => true,
            'password' => Hash::make('admin12345'),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
