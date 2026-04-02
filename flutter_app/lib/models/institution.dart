import 'package:equatable/equatable.dart';

class Institution extends Equatable {
  final String id;
  final String name;
  final String type;
  final String city;
  final String state;
  final String? domain;
  final DateTime createdAt;

  const Institution({
    required this.id,
    required this.name,
    required this.type,
    required this.city,
    required this.state,
    this.domain,
    required this.createdAt,
  });

  factory Institution.fromJson(Map<String, dynamic> json) {
    return Institution(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      type: json['type'] ?? 'college',
      city: json['city'] ?? '',
      state: json['state'] ?? '',
      domain: json['domain'],
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'type': type,
      'city': city,
      'state': state,
      'domain': domain,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  @override
  List<Object?> get props => [id, name, type, city, state, domain, createdAt];
}

class Batch extends Equatable {
  final String id;
  final String name;
  final int graduationYear;
  final String institutionId;
  final String? departmentId;
  final DateTime createdAt;

  const Batch({
    required this.id,
    required this.name,
    required this.graduationYear,
    required this.institutionId,
    this.departmentId,
    required this.createdAt,
  });

  factory Batch.fromJson(Map<String, dynamic> json) {
    return Batch(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      graduationYear: json['graduationYear'] ?? 0,
      institutionId: json['institutionId'] ?? '',
      departmentId: json['departmentId'],
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
    );
  }

  @override
  List<Object?> get props => [
    id,
    name,
    graduationYear,
    institutionId,
    departmentId,
  ];
}

class Department extends Equatable {
  final String id;
  final String name;
  final String institutionId;
  final DateTime createdAt;

  const Department({
    required this.id,
    required this.name,
    required this.institutionId,
    required this.createdAt,
  });

  factory Department.fromJson(Map<String, dynamic> json) {
    return Department(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      institutionId: json['institutionId'] ?? '',
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
    );
  }

  @override
  List<Object?> get props => [id, name, institutionId];
}
