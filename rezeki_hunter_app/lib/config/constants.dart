import 'package:flutter/material.dart';

class ApiConfig {
  // TUKAR IKUT DEVICE:
  // Chrome Web: http://127.0.0.1:8000/api
  // Android Emulator: http://10.0.2.2:8000/api
  // Physical Device (same WiFi): http://YOUR_IP:8000/api
  static const String baseUrl = 'http://127.0.0.1:8000/api';
  static const String storageUrl = 'http://127.0.0.1:8000/storage';
}

class AppColors {
  // Primary
  static const Color teal = Color(0xFF0F766E);
  static const Color tealLight = Color(0xFF2DD4BF);
  static const Color tealSoft = Color(0xFFF0FDFA);

  // Accent
  static const Color pink = Color(0xFFFF69B4);
  static const Color pinkSoft = Color(0xFFFFF0F6);
  static const Color cyan = Color(0xFF00F0FF);

  // Neutral
  static const Color dark = Color(0xFF0F172A);
  static const Color darkSoft = Color(0xFF1E293B);
  static const Color gray = Color(0xFF64748B);
  static const Color grayLight = Color(0xFF94A3B8);
  static const Color grayMuted = Color(0xFFCBD5E1);

  // Surfaces - BUKAN putih mati
  static const Color bg = Color(0xFFF8FAFC);        // off-white
  static const Color bgTint = Color(0xFFF0FDFA);    // teal tint
  static const Color card = Color(0xFFFFFFFF);
  static const Color border = Color(0xFFE2E8F0);
  static const Color inputBg = Color(0xFFF8FAFC);

  // Status
  static const Color green = Color(0xFF10B981);
  static const Color greenSoft = Color(0xFFDCFCE7);
  static const Color purple = Color(0xFF8B5CF6);
  static const Color purpleSoft = Color(0xFFF3E8FF);
  static const Color red = Color(0xFFEF4444);
  static const Color redSoft = Color(0xFFFEE2E2);
  static const Color blue = Color(0xFF3B82F6);
  static const Color blueSoft = Color(0xFFDBEAFE);
}

class CampusLocations {
  static const List<String> locations = [
    'Foyer FSKTM',
    'Foyer FSSKJ',
    'Foyer FPM',
    'Foyer FPQS',
    'Kolej Kediaman 1',
    'Kolej Kediaman 2',
    'Kolej Kediaman 3',
    'Kolej Kediaman 4',
    'Dewan Kuliah 1',
    'Dewan Kuliah 2',
    'Bilik Mesyuarat Library',
    'Perpustakaan Tun Razak',
    'Kafeteria FSKTM',
    'Kafeteria Utama',
    'Dewan Sri Budiman',
    'Kompleks Sukan',
  ];
}
