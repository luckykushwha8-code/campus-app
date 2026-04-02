import 'package:equatable/equatable.dart';

class Note extends Equatable {
  final String id;
  final String title;
  final String? description;
  final String fileUrl;
  final String subject;
  final String institutionId;
  final String? batchId;
  final String uploadedById;
  final DateTime createdAt;
  final DateTime updatedAt;
  final int downloadsCount;

  const Note({
    required this.id,
    required this.title,
    this.description,
    required this.fileUrl,
    required this.subject,
    required this.institutionId,
    this.batchId,
    required this.uploadedById,
    required this.createdAt,
    required this.updatedAt,
    this.downloadsCount = 0,
  });

  factory Note.fromJson(Map<String, dynamic> json) {
    return Note(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'],
      fileUrl: json['fileUrl'] ?? '',
      subject: json['subject'] ?? '',
      institutionId: json['institutionId'] ?? '',
      batchId: json['batchId'],
      uploadedById: json['uploadedById'] ?? '',
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'])
          : DateTime.now(),
      downloadsCount: json['downloadsCount'] ?? 0,
    );
  }

  @override
  List<Object?> get props => [
    id,
    title,
    description,
    fileUrl,
    subject,
    institutionId,
  ];
}

class Event extends Equatable {
  final String id;
  final String title;
  final String? description;
  final String? image;
  final String? location;
  final DateTime startDate;
  final DateTime? endDate;
  final String organizerId;
  final String institutionId;
  final String? clubId;
  final bool isPublic;
  final DateTime createdAt;
  final DateTime updatedAt;
  final int rsvpCount;
  final bool isRsvped;

  const Event({
    required this.id,
    required this.title,
    this.description,
    this.image,
    this.location,
    required this.startDate,
    this.endDate,
    required this.organizerId,
    required this.institutionId,
    this.clubId,
    this.isPublic = true,
    required this.createdAt,
    required this.updatedAt,
    this.rsvpCount = 0,
    this.isRsvped = false,
  });

  factory Event.fromJson(Map<String, dynamic> json) {
    return Event(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'],
      image: json['image'],
      location: json['location'],
      startDate: json['startDate'] != null
          ? DateTime.parse(json['startDate'])
          : DateTime.now(),
      endDate: json['endDate'] != null ? DateTime.parse(json['endDate']) : null,
      organizerId: json['organizerId'] ?? '',
      institutionId: json['institutionId'] ?? '',
      clubId: json['clubId'],
      isPublic: json['isPublic'] ?? true,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'])
          : DateTime.now(),
      rsvpCount: json['rsvpCount'] ?? 0,
      isRsvped: json['isRsvped'] ?? false,
    );
  }

  @override
  List<Object?> get props => [
    id,
    title,
    startDate,
    endDate,
    institutionId,
    isRsvped,
  ];
}

class Job extends Equatable {
  final String id;
  final String title;
  final String? company;
  final String description;
  final String jobType;
  final String? location;
  final String? salary;
  final String? applyLink;
  final String institutionId;
  final String postedById;
  final bool isActive;
  final DateTime createdAt;
  final DateTime? expiresAt;
  final int applicationsCount;

  const Job({
    required this.id,
    required this.title,
    this.company,
    required this.description,
    required this.jobType,
    this.location,
    this.salary,
    this.applyLink,
    required this.institutionId,
    required this.postedById,
    this.isActive = true,
    required this.createdAt,
    this.expiresAt,
    this.applicationsCount = 0,
  });

  factory Job.fromJson(Map<String, dynamic> json) {
    return Job(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      company: json['company'],
      description: json['description'] ?? '',
      jobType: json['jobType'] ?? 'full-time',
      location: json['location'],
      salary: json['salary'],
      applyLink: json['applyLink'],
      institutionId: json['institutionId'] ?? '',
      postedById: json['postedById'] ?? '',
      isActive: json['isActive'] ?? true,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
      expiresAt: json['expiresAt'] != null
          ? DateTime.parse(json['expiresAt'])
          : null,
      applicationsCount: json['applicationsCount'] ?? 0,
    );
  }

  @override
  List<Object?> get props => [
    id,
    title,
    company,
    jobType,
    institutionId,
    isActive,
  ];
}

class LostItem extends Equatable {
  final String id;
  final String title;
  final String? description;
  final String? image;
  final String? location;
  final String status;
  final String institutionId;
  final String postedById;
  final DateTime createdAt;
  final DateTime updatedAt;

  const LostItem({
    required this.id,
    required this.title,
    this.description,
    this.image,
    this.location,
    required this.status,
    required this.institutionId,
    required this.postedById,
    required this.createdAt,
    required this.updatedAt,
  });

  factory LostItem.fromJson(Map<String, dynamic> json) {
    return LostItem(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'],
      image: json['image'],
      location: json['location'],
      status: json['status'] ?? 'lost',
      institutionId: json['institutionId'] ?? '',
      postedById: json['postedById'] ?? '',
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'])
          : DateTime.now(),
    );
  }

  @override
  List<Object?> get props => [id, title, status, location, institutionId];
}

class MarketplaceItem extends Equatable {
  final String id;
  final String title;
  final String? description;
  final double price;
  final List<String>? images;
  final String category;
  final String? condition;
  final String institutionId;
  final String postedById;
  final bool isSold;
  final DateTime createdAt;
  final DateTime updatedAt;

  const MarketplaceItem({
    required this.id,
    required this.title,
    this.description,
    required this.price,
    this.images,
    required this.category,
    this.condition,
    required this.institutionId,
    required this.postedById,
    this.isSold = false,
    required this.createdAt,
    required this.updatedAt,
  });

  factory MarketplaceItem.fromJson(Map<String, dynamic> json) {
    return MarketplaceItem(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'],
      price: (json['price'] ?? 0).toDouble(),
      images: json['images'] != null ? List<String>.from(json['images']) : null,
      category: json['category'] ?? 'others',
      condition: json['condition'],
      institutionId: json['institutionId'] ?? '',
      postedById: json['postedById'] ?? '',
      isSold: json['isSold'] ?? false,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'])
          : DateTime.now(),
    );
  }

  @override
  List<Object?> get props => [
    id,
    title,
    price,
    category,
    institutionId,
    isSold,
  ];
}
