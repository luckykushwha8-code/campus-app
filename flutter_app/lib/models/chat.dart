import 'package:equatable/equatable.dart';
import 'user.dart';

class ChatMessage extends Equatable {
  final String id;
  final String content;
  final String conversationId;
  final String senderId;
  final User? sender;
  final DateTime createdAt;
  final bool isRead;

  const ChatMessage({
    required this.id,
    required this.content,
    required this.conversationId,
    required this.senderId,
    this.sender,
    required this.createdAt,
    this.isRead = false,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      id: json['id'] ?? '',
      content: json['content'] ?? '',
      conversationId: json['conversationId'] ?? '',
      senderId: json['senderId'] ?? '',
      sender: json['sender'] != null ? User.fromJson(json['sender']) : null,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
      isRead: json['isRead'] ?? false,
    );
  }

  @override
  List<Object?> get props => [
    id,
    content,
    conversationId,
    senderId,
    createdAt,
    isRead,
  ];
}

class Conversation extends Equatable {
  final String id;
  final String type;
  final String? name;
  final String? avatar;
  final List<User> participants;
  final ChatMessage? lastMessage;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Conversation({
    required this.id,
    this.type = 'direct',
    this.name,
    this.avatar,
    required this.participants,
    this.lastMessage,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Conversation.fromJson(Map<String, dynamic> json) {
    return Conversation(
      id: json['id'] ?? '',
      type: json['type'] ?? 'direct',
      name: json['name'],
      avatar: json['avatar'],
      participants:
          (json['participants'] as List?)
              ?.map((p) => User.fromJson(p))
              .toList() ??
          [],
      lastMessage: json['lastMessage'] != null
          ? ChatMessage.fromJson(json['lastMessage'])
          : null,
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
    type,
    name,
    participants,
    lastMessage,
    updatedAt,
  ];
}
