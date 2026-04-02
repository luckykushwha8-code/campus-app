import 'package:equatable/equatable.dart';

class Room extends Equatable {
  final String id;
  final String name;
  final String? description;
  final String type;
  final String institutionId;
  final String? batchId;
  final String? departmentId;
  final String? clubId;
  final String? eventId;
  final bool isPublic;
  final DateTime createdAt;
  final DateTime updatedAt;
  final int membersCount;
  final bool isJoined;

  const Room({
    required this.id,
    required this.name,
    this.description,
    required this.type,
    required this.institutionId,
    this.batchId,
    this.departmentId,
    this.clubId,
    this.eventId,
    this.isPublic = true,
    required this.createdAt,
    required this.updatedAt,
    this.membersCount = 0,
    this.isJoined = false,
  });

  factory Room.fromJson(Map<String, dynamic> json) {
    return Room(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'],
      type: json['type'] ?? 'college',
      institutionId: json['institutionId'] ?? '',
      batchId: json['batchId'],
      departmentId: json['departmentId'],
      clubId: json['clubId'],
      eventId: json['eventId'],
      isPublic: json['isPublic'] ?? true,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'])
          : DateTime.now(),
      membersCount: json['membersCount'] ?? 0,
      isJoined: json['isJoined'] ?? false,
    );
  }

  @override
  List<Object?> get props => [
        id,
        name,
        description,
        type,
        institutionId,
        isPublic,
        membersCount,
        isJoined,
      ];
}
