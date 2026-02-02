<?php

namespace Database\Seeders;

use App\Models\Food;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Admin account
        $admin = User::create([
            'name' => 'Admin',
            'email' => 'admin@rezeki.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        // Student accounts
        $ariq = User::create([
            'name' => 'Ariq Haikal',
            'email' => 'ariq@student.com',
            'password' => Hash::make('password'),
            'role' => 'student',
        ]);

        $ali = User::create([
            'name' => 'Ali Ahmad',
            'email' => 'ali@student.com',
            'password' => Hash::make('password'),
            'role' => 'student',
        ]);

        $siti = User::create([
            'name' => 'Siti Nurhaliza',
            'email' => 'siti@student.com',
            'password' => Hash::make('password'),
            'role' => 'student',
        ]);

        // Sample foods
        Food::create([
            'user_id' => $ariq->id,
            'title' => 'Nasi Lemak Lebih Event',
            'description' => 'Ada 10 bungkus lebih dari event FSKTM tadi. Masih panas!',
            'location' => 'Foyer FSKTM',
            'status' => 'available',
        ]);

        Food::create([
            'user_id' => $ali->id,
            'title' => 'Kuih Muih Majlis',
            'description' => 'Pelbagai jenis kuih dari majlis kolej. Ambil cepat!',
            'location' => 'Kolej Kediaman 1',
            'status' => 'available',
        ]);

        Food::create([
            'user_id' => $siti->id,
            'title' => 'Pizza 3 Kotak',
            'description' => 'Meeting cancel, pizza tak sentuh lagi. First come first serve.',
            'location' => 'Bilik Mesyuarat Library',
            'status' => 'available',
        ]);

        Food::create([
            'user_id' => $ariq->id,
            'title' => 'Air Kotak & Sandwich',
            'description' => 'Leftover from workshop pagi tadi.',
            'location' => 'Dewan Kuliah 1',
            'status' => 'taken',
            'claimed_by' => $ali->id,
            'claimed_at' => now(),
        ]);
    }
}
