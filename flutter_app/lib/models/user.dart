import 'package:equatable/equatable.dart';

class User extends Equatable {
  final String id;
  final String email;
  final String name;
  final String? username;
  final String? avatar;
  final String? bio;
  final String? phone;
  final String? collegeId;
  final String? institutionId;
  final String? department;
  final int? graduationYear;
  final int verificationLevel;
  final bool isVerified;
  final DateTime createdAt;
  final DateTime updatedAt;
  final int followersCount;
  final int followingCount;
  final int postsCount;

  const User({
    required this.id,
    required this.email,
    required this.name,
    this.username,
    this.avatar,
    this.bio,
    this.phone,
    this.collegeId,
    this.institutionId,
    this.department,
    this.graduationYear,
    this.verificationLevel = 1,
    this.isVerified = false,
    required this.createdAt,
    required this.updatedAt,
    this.followersCount = 0,
    this.followingCount = 0,
    this.postsCount = 0,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? '',
      email: json['email'] ?? '',
      name: json['name'] ?? '',
      username: json['username'],
      avatar: json['avatar'],
      bio: json['bio'],
      phone: json['phone'],
      collegeId: json['collegeId'],
      institutionId: json['institutionId'],
      department: json['department'],
      graduationYear: json['graduationYear'],
      verificationLevel: json['verificationLevel'] ?? 1,
      isVerified: json['isVerified'] ?? false,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'])
          : DateTime.now(),
      followersCount: json['followersCount'] ?? 0,
      followingCount: json['followingCount'] ?? 0,
      postsCount: json['postsCount'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'username': username,
      'avatar': avatar,
      'bio': bio,
      'phone': phone,
      'collegeId': collegeId,
      'institutionId': institutionId,
      'department': department,
      'graduationYear': graduationYear,
      'verificationLevel': verificationLevel,
      'isVerified': isVerified,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  User copyWith({
    String? id,
    String? email,
    String? name,
    String? username,
    String? avatar,
    String? bio,
    String? phone,
    String? collegeId,
    String? institutionId,
    String? department,
    int? graduationYear,
    int? verificationLevel,
    bool? isVerified,
    DateTime? createdAt,
    DateTime? updatedAt,
    int? followersCount,
    int? followingCount,
    int? postsCount,
  }) {
    return User(
      id: id ?? this.id,
      email: email ?? this.email,
      name: name ?? this.name,
      username: username ?? this.username,
      avatar: avatar ?? this.avatar,
      bio: bio ?? this.bio,
      phone: phone ?? this.phone,
      collegeId: collegeId ?? this.collegeId,
      institutionId: institutionId ?? this.institutionId,
      department: department ?? this.department,
      graduationYear: graduationYear ?? this.graduationYear,
      verificationLevel: verificationLevel ?? this.verificationLevel,
      isVerified: isVerified ?? this.isVerified,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      followersCount: followersCount ?? this.followersCount,
      followingCount: followingCount ?? this.followingCount,
      postsCount: postsCount ?? this.postsCount,
    );
  }

  @override
  List<Object?> get props => [
    id,
    email,
    name,
    username,
    avatar,
    bio,
    phone,
    collegeId,
    institutionId,
    department,
    graduationYear,
    verificationLevel,
    isVerified,
    createdAt,
    updatedAt,
  ];
}
