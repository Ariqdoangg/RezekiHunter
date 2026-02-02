import 'package:flutter/material.dart';
import '../config/constants.dart';
import '../models/food.dart';
import '../services/api_service.dart';
import '../services/auth_service.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  List<Food> _myFoods = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadMyFoods();
  }

  Future<void> _loadMyFoods() async {
    try {
      final res = await ApiService().getMyFoods();
      if (!mounted) return;
      setState(() {
        _myFoods = (res.data as List).map((e) => Food.fromJson(e)).toList();
        _loading = false;
      });
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _logout() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Sign Out', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 18)),
        content: const Text('Are you sure you want to sign out?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('Cancel', style: TextStyle(color: AppColors.gray, fontWeight: FontWeight.w600)),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(ctx);
              await ApiService().logout();
              if (!mounted) return;
              Navigator.pushNamedAndRemoveUntil(context, '/login', (_) => false);
            },
            child: const Text('Sign Out', style: TextStyle(color: AppColors.red, fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = AuthService();
    final posted = _myFoods.length;
    final claimed = _myFoods.where((f) => f.isTaken).length;
    final active = _myFoods.where((f) => f.isAvailable).length;

    return SafeArea(
      child: RefreshIndicator(
        onRefresh: _loadMyFoods,
        color: AppColors.teal,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Column(
            children: [
              const SizedBox(height: 24),

              // ── Avatar (No Big Block) ──
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: const LinearGradient(
                    colors: [AppColors.tealLight, AppColors.teal],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  boxShadow: [
                    BoxShadow(color: AppColors.teal.withOpacity(0.2), blurRadius: 16, offset: const Offset(0, 6)),
                  ],
                ),
                child: Center(
                  child: Text(
                    auth.userName[0].toUpperCase(),
                    style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w800, color: Colors.white),
                  ),
                ),
              ),
              const SizedBox(height: 14),

              // Name
              Text(
                auth.userName,
                style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.dark, letterSpacing: -0.3),
              ),
              const SizedBox(height: 3),

              // Email
              Text(auth.userEmail, style: TextStyle(fontSize: 13, color: AppColors.grayLight)),
              const SizedBox(height: 8),

              // Role chip
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 5),
                decoration: BoxDecoration(
                  color: auth.userRole == 'admin' ? AppColors.pinkSoft : AppColors.tealSoft,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  auth.userRole == 'admin' ? '⭐ Admin' : '🎓 Student',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: auth.userRole == 'admin' ? AppColors.pink : AppColors.teal,
                  ),
                ),
              ),

              const SizedBox(height: 28),

              // ── Stats Row (Clean, Inline) ──
              Container(
                padding: const EdgeInsets.symmetric(vertical: 20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 12)],
                ),
                child: Row(
                  children: [
                    _statItem(posted.toString(), 'Posted', AppColors.teal),
                    _divider(),
                    _statItem(claimed.toString(), 'Claimed', AppColors.purple),
                    _divider(),
                    _statItem(active.toString(), 'Active', AppColors.green),
                  ],
                ),
              ),

              const SizedBox(height: 28),

              // ── My Posts Header ──
              Row(
                children: [
                  const Text('My Posts', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.dark)),
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.bg,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      '${_myFoods.length} total',
                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.gray),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              // ── My Posts List ──
              if (_loading)
                const Padding(
                  padding: EdgeInsets.all(40),
                  child: CircularProgressIndicator(color: AppColors.teal, strokeWidth: 2.5),
                )
              else if (_myFoods.isEmpty)
                _emptyPosts()
              else
                ...(_myFoods.map((food) => _foodTile(food))),

              const SizedBox(height: 28),

              // ── Sign Out ──
              SizedBox(
                width: double.infinity,
                height: 48,
                child: OutlinedButton.icon(
                  onPressed: _logout,
                  icon: const Icon(Icons.logout_rounded, size: 18),
                  label: const Text('Sign Out', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.red,
                    side: BorderSide(color: AppColors.red.withOpacity(0.25)),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Text('Rezeki Hunter v1.0', style: TextStyle(fontSize: 11, color: AppColors.grayMuted)),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _statItem(String value, String label, Color color) {
    return Expanded(
      child: Column(
        children: [
          Text(
            value,
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: color),
          ),
          const SizedBox(height: 2),
          Text(label, style: TextStyle(fontSize: 12, color: AppColors.gray, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }

  Widget _divider() {
    return Container(width: 1, height: 36, color: AppColors.border);
  }

  Widget _emptyPosts() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 40),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        children: [
          const Text('🍽️', style: TextStyle(fontSize: 40)),
          const SizedBox(height: 12),
          const Text('No posts yet', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: AppColors.dark)),
          const SizedBox(height: 4),
          Text('Start sharing food!', style: TextStyle(fontSize: 13, color: AppColors.grayLight)),
        ],
      ),
    );
  }

  Widget _foodTile(Food food) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 8)],
      ),
      child: Row(
        children: [
          // Thumbnail
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: AppColors.tealSoft,
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Center(child: Text('🍱', style: TextStyle(fontSize: 22))),
          ),
          const SizedBox(width: 12),

          // Info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  food.title,
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.dark),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 3),
                Row(
                  children: [
                    Icon(Icons.location_on_outlined, size: 12, color: AppColors.grayLight),
                    const SizedBox(width: 3),
                    Expanded(
                      child: Text(
                        '${food.location} · ${food.timeAgo}',
                        style: TextStyle(fontSize: 11, color: AppColors.grayLight),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),

          // Status
          _statusChip(food.status),
        ],
      ),
    );
  }

  Widget _statusChip(String status) {
    Color color;
    Color bg;
    String label;

    switch (status) {
      case 'available':
        color = AppColors.green; bg = AppColors.greenSoft; label = 'Active'; break;
      case 'taken':
        color = AppColors.purple; bg = AppColors.purpleSoft; label = 'Claimed'; break;
      default:
        color = AppColors.red; bg = AppColors.redSoft; label = 'Expired';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(10)),
      child: Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: color)),
    );
  }
}
