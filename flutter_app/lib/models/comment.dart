import 'package:equatable/equatable.dart';
import 'user.dart';

class Comment extends Equatable {
  final String id;
  final String content;
  final String postId;
  final String authorId;
  final User? author;
  final String? parentId;
  final DateTime createdAt;
  final int repliesCount;

  const Comment({
    required this.id,
    required this.content,
    required this.postId,
    required this.authorId,
    this.author,
    this.parentId,
    required this.createdAt,
    this.repliesCount = 0,
  });

  factory Comment.fromJson(Map<String, dynamic> json) {
    return Comment(
      id: json['id'] ?? '',
      content: json['content'] ?? '',
      postId: json['postId'] ?? '',
      authorId: json['authorId'] ?? '',
      author: json['author'] != null ? User.fromJson(json['author']) : null,
      parentId: json['parentId'],
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
      repliesCount: json['repliesCount'] ?? 0,
    );
  }

  @override
  List<Object?> get props => [
    id,
    content,
    postId,
    authorId,
    parentId,
    createdAt,
  ];
}
