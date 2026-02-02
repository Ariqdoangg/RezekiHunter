import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../config/constants.dart';
import '../models/food.dart';

class FoodDetailSheet extends StatelessWidget {
  final Food food;
  final int currentUserId;
  final VoidCallback? onClaim;

  const FoodDetailSheet({
    super.key,
    required this.food,
    required this.currentUserId,
    this.onClaim,
  });

  static void show(BuildContext context, Food food, int currentUserId, VoidCallback? onClaim) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => FoodDetailSheet(food: food, currentUserId: currentUserId, onClaim: onClaim),
    );
  }

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.85,
      maxChildSize: 0.95,
      minChildSize: 0.5,
      builder: (_, controller) {
        return Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: ListView(
            controller: controller,
            padding: EdgeInsets.zero,
            children: [
              // Handle
              Center(
                child: Container(
                  margin: const EdgeInsets.only(top: 12, bottom: 8),
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: AppColors.grayMuted,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),

              // Image
              if (food.imageUrl != null && food.imageUrl!.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(16),
                    child: CachedNetworkImage(
                      imageUrl: food.imageUrl!,
                      height: 220,
                      width: double.infinity,
                      fit: BoxFit.cover,
                      errorWidget: (_, __, ___) => _placeholder(),
                    ),
                  ),
                )
              else
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: _placeholder(),
                ),

              Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Status + Time
                    Row(
                      children: [
                        _statusBadge(),
                        const Spacer(),
                        Icon(Icons.schedule_rounded, size: 14, color: AppColors.grayLight),
                        const SizedBox(width: 4),
                        Text(food.timeAgo, style: TextStyle(fontSize: 13, color: AppColors.gray)),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // Title
                    Text(
                      food.title,
                      style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: AppColors.dark, letterSpacing: -0.5),
                    ),
                    const SizedBox(height: 8),

                    // Description
                    if (food.description.isNotEmpty)
                      Text(
                        food.description,
                        style: TextStyle(fontSize: 14, color: AppColors.gray, height: 1.6),
                      ),

                    const SizedBox(height: 20),

                    // Info chips
                    _infoRow(Icons.location_on_rounded, food.location),
                    const SizedBox(height: 10),
                    _infoRow(Icons.person_rounded, 'Posted by ${food.user?.name ?? "Unknown"}'),

                    if (food.isTaken && food.claimer != null) ...[
                      const SizedBox(height: 10),
                      _infoRow(Icons.volunteer_activism_rounded, 'Claimed by ${food.claimer!.name}'),
                    ],

                    const SizedBox(height: 28),

                    // Claim Button
                    if (food.isAvailable && food.userId != currentUserId)
                      SizedBox(
                        width: double.infinity,
                        height: 52,
                        child: DecoratedBox(
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(16),
                            gradient: const LinearGradient(colors: [AppColors.teal, AppColors.tealLight]),
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.tealLight.withOpacity(0.3),
                                blurRadius: 16,
                                offset: const Offset(0, 6),
                              ),
                            ],
                          ),
                          child: ElevatedButton.icon(
                            onPressed: () {
                              Navigator.pop(context);
                              onClaim?.call();
                            },
                            icon: const Icon(Icons.front_hand_rounded, size: 18),
                            label: const Text('Claim Rezeki', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.transparent,
                              foregroundColor: Colors.white,
                              shadowColor: Colors.transparent,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                            ),
                          ),
                        ),
                      )
                    else if (food.isTaken)
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: AppColors.purpleSoft.withOpacity(0.5),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.check_circle_rounded, color: AppColors.purple, size: 20),
                            const SizedBox(width: 8),
                            Text(
                              'This rezeki has been claimed',
                              style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.purple),
                            ),
                          ],
                        ),
                      )
                    else if (food.isExpired)
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: AppColors.redSoft.withOpacity(0.5),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.timer_off_rounded, color: AppColors.red, size: 20),
                            const SizedBox(width: 8),
                            Text(
                              'This post has expired',
                              style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.red),
                            ),
                          ],
                        ),
                      ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _placeholder() {
    return Container(
      height: 160,
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: [AppColors.tealSoft, AppColors.bgTint]),
        borderRadius: BorderRadius.circular(16),
      ),
      child: const Center(child: Text('🍱', style: TextStyle(fontSize: 48))),
    );
  }

  Widget _infoRow(IconData icon, String text) {
    return Row(
      children: [
        Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: AppColors.bg,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, size: 16, color: AppColors.teal),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Text(text, style: TextStyle(fontSize: 14, color: AppColors.dark, fontWeight: FontWeight.w500)),
        ),
      ],
    );
  }

  Widget _statusBadge() {
    Color color;
    Color bgColor;
    String label;

    switch (food.status) {
      case 'available':
        color = AppColors.green;
        bgColor = AppColors.greenSoft;
        label = '🟢 Available';
        break;
      case 'taken':
        color = AppColors.purple;
        bgColor = AppColors.purpleSoft;
        label = '🤝 Claimed';
        break;
      default:
        color = AppColors.red;
        bgColor = AppColors.redSoft;
        label = '⏰ Expired';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(color: bgColor, borderRadius: BorderRadius.circular(10)),
      child: Text(label, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: color)),
    );
  }
}
