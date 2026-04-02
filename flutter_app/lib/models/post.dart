import 'package:equatable/equatable.dart';
import 'user.dart';

class Post extends Equatable {
  final String id;
  final String content;
  final List<String>? images;
  final String authorId;
  final User? author;
  final String? batchId;
  final String? roomId;
  final String? clubId;
  final bool isAnonymous;
  final DateTime createdAt;
  final DateTime updatedAt;
  final int likesCount;
  final int commentsCount;
  final int savesCount;
  final bool isLiked;
  final bool isSaved;

  const Post({
    required this.id,
    required this.content,
    this.images,
    required this.authorId,
    this.author,
    this.batchId,
    this.roomId,
    this.clubId,
    this.isAnonymous = false,
    required this.createdAt,
    required this.updatedAt,
    this.likesCount = 0,
    this.commentsCount = 0,
    this.savesCount = 0,
    this.isLiked = false,
    this.isSaved = false,
  });

  factory Post.fromJson(Map<String, dynamic> json) {
    return Post(
      id: json['id'] ?? '',
      content: json['content'] ?? '',
      images: json['images'] != null ? List<String>.from(json['images']) : null,
      authorId: json['authorId'] ?? '',
      author: json['author'] != null ? User.fromJson(json['author']) : null,
      batchId: json['batchId'],
      roomId: json['roomId'],
      clubId: json['clubId'],
      isAnonymous: json['isAnonymous'] ?? false,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'])
          : DateTime.now(),
      likesCount: json['likesCount'] ?? 0,
      commentsCount: json['commentsCount'] ?? 0,
      savesCount: json['savesCount'] ?? 0,
      isLiked: json['isLiked'] ?? false,
      isSaved: json['isSaved'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'content': content,
      'images': images,
      'authorId': authorId,
      'batchId': batchId,
      'roomId': roomId,
      'clubId': clubId,
      'isAnonymous': isAnonymous,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  Post copyWith({
    String? id,
    String? content,
    List<String>? images,
    String? authorId,
    User? author,
    String? batchId,
    String? roomId,
    String? clubId,
    bool? isAnonymous,
    DateTime? createdAt,
    DateTime? updatedAt,
    int? likesCount,
    int? commentsCount,
    int? savesCount,
    bool? isLiked,
    bool? isSaved,
  }) {
    return Post(
      id: id ?? this.id,
      content: content ?? this.content,
      images: images ?? this.images,
      authorId: authorId ?? this.authorId,
      author: author ?? this.author,
      batchId: batchId ?? this.batchId,
      roomId: roomId ?? this.roomId,
      clubId: clubId ?? this.clubId,
      isAnonymous: isAnonymous ?? this.isAnonymous,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      likesCount: likesCount ?? this.likesCount,
      commentsCount: commentsCount ?? this.commentsCount,
      savesCount: savesCount ?? this.savesCount,
      isLiked: isLiked ?? this.isLiked,
      isSaved: isSaved ?? this.isSaved,
    );
  }

  @override
  List<Object?> get props => [
    id,
    content,
    images,
    authorId,
    author,
    batchId,
    roomId,
    clubId,
    isAnonymous,
    createdAt,
    updatedAt,
    likesCount,
    commentsCount,
    isLiked,
    isSaved,
  ];
}
