<?php

namespace Database\Seeders;

use App\Models\Project;
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
        // Create or update admin user
        DB::table('users')->updateOrInsert(
            ['username' => 'admin'],
            [
                'name' => 'Administrator SIMPRO',
                'email' => 'admin@simpro.local',
                'role' => 'admin',
                'position' => 'Admin Sistem',
                'is_active' => true,
                'password' => Hash::make('123456'),
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        // Get admin user id
        $adminUser = DB::table('users')->where('username', 'admin')->first();

        // Create PJ user
        $pjUser = DB::table('users')->insertOrIgnore([
            'name' => 'Budi Santoso',
            'username' => 'pj001',
            'email' => 'budi@simpro.local',
            'role' => 'pj_konstruksi',
            'position' => 'Project Manager',
            'is_active' => true,
            'password' => Hash::make('123456'),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $pjUserId = DB::table('users')->where('username', 'pj001')->first()?->id;

        // Create test projects
        if ($pjUserId) {
            DB::table('projects')->insertOrIgnore([
                [
                    'code' => 'PROJ-001',
                    'name' => 'Gedung Perkantoran Pusat',
                    'client_name' => 'PT. Maju Jaya',
                    'location' => 'Jl. Sudirman No. 123, Jakarta Selatan',
                    'start_date' => '2026-01-15',
                    'end_date' => '2026-06-15',
                    'budget' => 5000000000,
                    'progress' => 45,
                    'status' => 'running',
                    'pj_user_id' => $pjUserId,
                    'created_by' => $adminUser->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'code' => 'PROJ-002',
                    'name' => 'Renovasi Kompleks Perumahan',
                    'client_name' => 'PT. Harmoni Properti',
                    'location' => 'Jl. Pahlawan No. 45, Tangerang',
                    'start_date' => '2026-01-20',
                    'end_date' => '2026-05-20',
                    'budget' => 3500000000,
                    'progress' => 85,
                    'status' => 'running',
                    'pj_user_id' => $pjUserId,
                    'created_by' => $adminUser->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'code' => 'PROJ-003',
                    'name' => 'Pembangunan Pabrik Tekstil',
                    'client_name' => 'PT. Tekstil Nusantara',
                    'location' => 'Jl. Industri No. 10, Karawang',
                    'start_date' => '2026-02-01',
                    'end_date' => '2026-08-01',
                    'budget' => 8000000000,
                    'progress' => 20,
                    'status' => 'running',
                    'pj_user_id' => $pjUserId,
                    'created_by' => $adminUser->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);
        }
    }
}
