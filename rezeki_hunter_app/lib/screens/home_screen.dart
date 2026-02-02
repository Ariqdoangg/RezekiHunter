import 'package:flutter/material.dart';
import '../config/constants.dart';
import '../models/food.dart';
import '../services/api_service.dart';
import '../services/auth_service.dart';
import '../widgets/food_card.dart';
import '../widgets/food_detail_sheet.dart';
import 'add_food_screen.dart';
import 'profile_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;
  final _pageController = PageController();

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _onTabChanged(int index) {
    setState(() => _currentIndex = index);
    _pageController.animateToPage(
      index,
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeOutCubic,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: PageView(
        controller: _pageController,
        physics: const NeverScrollableScrollPhysics(),
        children: const [
          _FeedPage(),
          AddFoodScreen(),
          ProfileScreen(),
        ],
      ),
      bottomNavigationBar: _buildBottomNav(),
    );
  }

  Widget _buildBottomNav() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 20,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _navItem(0, Icons.home_rounded, Icons.home_outlined, 'Feed'),
              _navItem(1, Icons.add_circle_rounded, Icons.add_circle_outline, 'Post'),
              _navItem(2, Icons.person_rounded, Icons.person_outline_rounded, 'Profile'),
            ],
          ),
        ),
      ),
    );
  }

  Widget _navItem(int index, IconData activeIcon, IconData inactiveIcon, String label) {
    final active = _currentIndex == index;
    return GestureDetector(
      onTap: () => _onTabChanged(index),
      behavior: HitTestBehavior.opaque,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        curve: Curves.easeOutCubic,
        padding: EdgeInsets.symmetric(horizontal: active ? 20 : 16, vertical: 8),
        decoration: BoxDecoration(
          color: active ? AppColors.teal.withOpacity(0.08) : Colors.transparent,
          borderRadius: BorderRadius.circular(14),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              active ? activeIcon : inactiveIcon,
              size: 22,
              color: active ? AppColors.teal : AppColors.grayLight,
            ),
            if (active) ...[
              const SizedBox(width: 8),
              Text(
                label,
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.teal),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

// ────────────────────────────────────────────────
// Feed Page
// ────────────────────────────────────────────────
class _FeedPage extends StatefulWidget {
  const _FeedPage();
  @override
  State<_FeedPage> createState() => _FeedPageState();
}

class _FeedPageState extends State<_FeedPage> {
  List<Food> _foods = [];
  bool _loading = true;
  Map<String, dynamic> _stats = {};
  String _filter = 'all';

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final res = await ApiService().getFoods();
      final statsRes = await ApiService().getStats();
      if (!mounted) return;
      setState(() {
        _foods = (res.data as List).map((e) => Food.fromJson(e)).toList();
        _stats = statsRes.data;
        _loading = false;
      });
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  List<Food> get _filteredFoods {
    if (_filter == 'all') return _foods;
    return _foods.where((f) => f.status == _filter).toList();
  }

  Future<void> _claimFood(int id) async {
    try {
      await ApiService().claimFood(id);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Row(
            children: [
              Icon(Icons.celebration, color: Colors.white, size: 18),
              SizedBox(width: 8),
              Text('Alhamdulillah! Rezeki claimed! 🎉', style: TextStyle(fontWeight: FontWeight.w600)),
            ],
          ),
          backgroundColor: AppColors.teal,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          margin: const EdgeInsets.all(16),
        ),
      );
      _loadData();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Already taken or error', style: TextStyle(fontWeight: FontWeight.w600)),
          backgroundColor: AppColors.red,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          margin: const EdgeInsets.all(16),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Column(
        children: [
          // ── Premium Header ──
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
            child: Row(
              children: [
                // Logo
                Container(
                  width: 42,
                  height: 42,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(13),
                    gradient: const LinearGradient(colors: [AppColors.tealLight, AppColors.teal]),
                    boxShadow: [
                      BoxShadow(color: AppColors.teal.withOpacity(0.2), blurRadius: 8, offset: const Offset(0, 3)),
                    ],
                  ),
                  child: const Center(child: Text('🍱', style: TextStyle(fontSize: 20))),
                ),
                const SizedBox(width: 12),

                // Greeting
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Hi, ${AuthService().userName.split(' ')[0]}! 👋',
                        style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w800, color: AppColors.dark, letterSpacing: -0.3),
                      ),
                      const SizedBox(height: 1),
                      Text(
                        'Find some rezeki today',
                        style: TextStyle(fontSize: 12, color: AppColors.grayLight, fontWeight: FontWeight.w500),
                      ),
                    ],
                  ),
                ),

                // Live count pill
                if (_stats.isNotEmpty)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppColors.greenSoft,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 7,
                          height: 7,
                          decoration: const BoxDecoration(shape: BoxShape.circle, color: AppColors.green),
                        ),
                        const SizedBox(width: 6),
                        Text(
                          '${_stats['available'] ?? 0} ada',
                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.green),
                        ),
                      ],
                    ),
                  ),

                const SizedBox(width: 10),

                // Avatar
                Container(
                  width: 38,
                  height: 38,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: const LinearGradient(colors: [AppColors.pink, AppColors.teal]),
                    boxShadow: [
                      BoxShadow(color: AppColors.pink.withOpacity(0.15), blurRadius: 8, offset: const Offset(0, 2)),
                    ],
                  ),
                  child: Center(
                    child: Text(
                      AuthService().userName[0].toUpperCase(),
                      style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w800),
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // ── Filter Chips ──
          SizedBox(
            height: 36,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 20),
              children: [
                _filterChip('all', 'All'),
                _filterChip('available', 'Available'),
                _filterChip('taken', 'Claimed'),
                _filterChip('expired', 'Expired'),
              ],
            ),
          ),

          const SizedBox(height: 14),

          // ── Food List ──
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator(color: AppColors.teal, strokeWidth: 2.5))
                : _filteredFoods.isEmpty
                    ? _emptyState()
                    : RefreshIndicator(
                        onRefresh: _loadData,
                        color: AppColors.teal,
                        child: ListView.builder(
                          padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
                          itemCount: _filteredFoods.length,
                          itemBuilder: (context, index) {
                            final food = _filteredFoods[index];
                            return FoodCard(
                              food: food,
                              currentUserId: AuthService().userId,
                              onClaim: () => _claimFood(food.id),
                              onTap: () => FoodDetailSheet.show(
                                context,
                                food,
                                AuthService().userId,
                                () => _claimFood(food.id),
                              ),
                            );
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _filterChip(String value, String label) {
    final active = _filter == value;
    return GestureDetector(
      onTap: () => setState(() => _filter = value),
      child: Container(
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: active ? AppColors.teal : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: active ? AppColors.teal : AppColors.border,
            width: 1,
          ),
          boxShadow: active
              ? [BoxShadow(color: AppColors.teal.withOpacity(0.2), blurRadius: 8, offset: const Offset(0, 2))]
              : null,
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: active ? Colors.white : AppColors.gray,
          ),
        ),
      ),
    );
  }

  Widget _emptyState() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: AppColors.tealSoft,
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Center(child: Text('🍽️', style: TextStyle(fontSize: 36))),
          ),
          const SizedBox(height: 16),
          const Text('No food here', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.dark)),
          const SizedBox(height: 4),
          Text('Pull down to refresh', style: TextStyle(fontSize: 13, color: AppColors.grayLight)),
        ],
      ),
    );
  }
}
