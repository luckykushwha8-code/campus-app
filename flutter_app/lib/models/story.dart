import 'package:equatable/equatable.dart';
import 'user.dart';

class Story extends Equatable {
  final String id;
  final String image;
  final String authorId;
  final User? author;
  final DateTime expiresAt;
  final DateTime createdAt;

  const Story({
    required this.id,
    required this.image,
    required this.authorId,
    this.author,
    required this.expiresAt,
    required this.createdAt,
  });

  factory Story.fromJson(Map<String, dynamic> json) {
    return Story(
      id: json['id'] ?? '',
      image: json['image'] ?? '',
      authorId: json['authorId'] ?? '',
      author: json['author'] != null ? User.fromJson(json['author']) : null,
      expiresAt: json['expiresAt'] != null
          ? DateTime.parse(json['expiresAt'])
          : DateTime.now().add(const Duration(hours: 24)),
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
    );
  }

  bool get isExpired => DateTime.now().isAfter(expiresAt);

  @override
  List<Object?> get props => [id, image, authorId, expiresAt, createdAt];
}

class StoryGroup extends Equatable {
  final User user;
  final List<Story> stories;

  const StoryGroup({required this.user, required this.stories});

  factory StoryGroup.fromJson(Map<String, dynamic> json) {
    return StoryGroup(
      user: User.fromJson(json['user']),
      stories:
          (json['stories'] as List?)?.map((s) => Story.fromJson(s)).toList() ??
          [],
    );
  }

  @override
  List<Object?> get props => [user, stories];
}
