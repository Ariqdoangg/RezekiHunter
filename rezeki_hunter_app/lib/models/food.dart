class Food {
  final int id;
  final int userId;
  final String title;
  final String description;
  final String location;
  final String? imageUrl;
  final String status;
  final int? claimedBy;
  final String? claimedAt;
  final String createdAt;
  final FoodUser? user;
  final FoodUser? claimer;

  Food({
    required this.id,
    required this.userId,
    required this.title,
    required this.description,
    required this.location,
    this.imageUrl,
    required this.status,
    this.claimedBy,
    this.claimedAt,
    required this.createdAt,
    this.user,
    this.claimer,
  });

  factory Food.fromJson(Map<String, dynamic> json) {
    return Food(
      id: json['id'],
      userId: json['user_id'],
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      location: json['location'] ?? '',
      imageUrl: json['image_url'],
      status: json['status'] ?? 'available',
      claimedBy: json['claimed_by'],
      claimedAt: json['claimed_at'],
      createdAt: json['created_at'] ?? '',
      user: json['user'] != null ? FoodUser.fromJson(json['user']) : null,
      claimer: json['claimer'] != null ? FoodUser.fromJson(json['claimer']) : null,
    );
  }

  bool get isAvailable => status == 'available';
  bool get isTaken => status == 'taken';
  bool get isExpired => status == 'expired';

  String get timeAgo {
    final now = DateTime.now();
    final created = DateTime.parse(createdAt);
    final diff = now.difference(created);
    if (diff.inMinutes < 1) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    return '${diff.inDays}d ago';
  }
}

class FoodUser {
  final int id;
  final String name;
  final String email;

  FoodUser({required this.id, required this.name, required this.email});

  factory FoodUser.fromJson(Map<String, dynamic> json) {
    return FoodUser(
      id: json['id'],
      name: json['name'] ?? '',
      email: json['email'] ?? '',
    );
  }
}
