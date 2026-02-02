import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../config/constants.dart';
import '../models/food.dart';

class FoodCard extends StatelessWidget {
  final Food food;
  final int currentUserId;
  final VoidCallback? onClaim;
  final VoidCallback? onTap;

  const FoodCard({
    super.key,
    required this.food,
    required this.currentUserId,
    this.onClaim,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 15,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Image Section (Full Width) ──
            _buildImage(),

            // ── Content Section ──
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Status + Time
                  Row(
                    children: [
                      _statusBadge(),
                      const Spacer(),
                      Icon(Icons.schedule_rounded, size: 13, color: AppColors.grayLight),
                      const SizedBox(width: 4),
                      Text(
                        food.timeAgo,
                        style: TextStyle(fontSize: 12, color: AppColors.grayLight, fontWeight: FontWeight.w500),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),

                  // Title
                  Text(
                    food.title,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: AppColors.dark,
                      letterSpacing: -0.3,
                      height: 1.2,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),

                  if (food.description.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Text(
                      food.description,
                      style: TextStyle(fontSize: 13, color: AppColors.gray, height: 1.4),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],

                  const SizedBox(height: 14),

                  // Bottom: Location + User + Claim
                  Row(
                    children: [
                      // Location
                      Expanded(
                        child: Row(
                          children: [
                            Icon(Icons.location_on_outlined, size: 14, color: AppColors.gray),
                            const SizedBox(width: 4),
                            Expanded(
                              child: Text(
                                food.location,
                                style: TextStyle(fontSize: 12, color: AppColors.gray, fontWeight: FontWeight.w500),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),

                      // User Avatar + Name
                      Row(
                        children: [
                          Container(
                            width: 22,
                            height: 22,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              gradient: const LinearGradient(
                                colors: [AppColors.tealLight, AppColors.teal],
                              ),
                            ),
                            child: Center(
                              child: Text(
                                food.user?.name[0] ?? '?',
                                style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w700),
                              ),
                            ),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            food.user?.name.split(' ')[0] ?? '',
                            style: TextStyle(fontSize: 12, color: AppColors.gray, fontWeight: FontWeight.w500),
                          ),
                        ],
                      ),

                      // Small Claim Button (only if available & not own post)
                      if (food.isAvailable && food.userId != currentUserId) ...[
                        const SizedBox(width: 10),
                        _claimButton(),
                      ],
                    ],
                  ),

                  // Claimed info
                  if (food.isTaken) ...[
                    const SizedBox(height: 12),
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
                      decoration: BoxDecoration(
                        color: AppColors.purpleSoft.withOpacity(0.5),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.check_circle_rounded, size: 14, color: AppColors.purple),
                          const SizedBox(width: 6),
                          Text(
                            'Claimed by ${food.claimer?.name ?? "someone"}',
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.purple),
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildImage() {
    if (food.imageUrl != null && food.imageUrl!.isNotEmpty) {
      return CachedNetworkImage(
        imageUrl: food.imageUrl!,
        height: 180,
        width: double.infinity,
        fit: BoxFit.cover,
        placeholder: (_, __) => Container(
          height: 180,
          color: AppColors.bg,
          child: const Center(
            child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.tealLight),
          ),
        ),
        errorWidget: (_, __, ___) => _placeholderImage(),
      );
    }
    return _placeholderImage();
  }

  Widget _placeholderImage() {
    return Container(
      height: 120,
      width: double.infinity,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [AppColors.tealSoft, AppColors.bgTint],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('🍱', style: const TextStyle(fontSize: 36)),
            const SizedBox(height: 4),
            Text(
              'No photo',
              style: TextStyle(fontSize: 11, color: AppColors.grayLight, fontWeight: FontWeight.w500),
            ),
          ],
        ),
      ),
    );
  }

  Widget _claimButton() {
    return Material(
      color: AppColors.teal,
      borderRadius: BorderRadius.circular(10),
      child: InkWell(
        onTap: onClaim,
        borderRadius: BorderRadius.circular(10),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.front_hand_rounded, size: 13, color: Colors.white),
              const SizedBox(width: 5),
              Text(
                'Claim',
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.white),
              ),
            ],
          ),
        ),
      ),
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
        label = 'Available';
        break;
      case 'taken':
        color = AppColors.purple;
        bgColor = AppColors.purpleSoft;
        label = 'Claimed';
        break;
      default:
        color = AppColors.red;
        bgColor = AppColors.redSoft;
        label = 'Expired';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 6,
            height: 6,
            decoration: BoxDecoration(shape: BoxShape.circle, color: color),
          ),
          const SizedBox(width: 5),
          Text(
            label,
            style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: color),
          ),
        ],
      ),
    );
  }
}
