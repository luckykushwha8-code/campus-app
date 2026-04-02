import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;
import '../core/constants/app_constants.dart';
import '../models/chat.dart';

typedef SocketEventCallback = void Function(dynamic data);

class SocketService {
  io.Socket? _socket;

  final _messageController = StreamController<ChatMessage>.broadcast();
  final _notificationController =
      StreamController<Map<String, dynamic>>.broadcast();
  final _roomActivityController =
      StreamController<Map<String, dynamic>>.broadcast();
  final _connectionController = StreamController<bool>.broadcast();

  final Map<String, List<SocketEventCallback>> _eventListeners = {};
  bool _isConnected = false;
  String? _currentUserId;

  SocketService();

  Stream<ChatMessage> get messageStream => _messageController.stream;
  Stream<Map<String, dynamic>> get notificationStream =>
      _notificationController.stream;
  Stream<Map<String, dynamic>> get roomActivityStream =>
      _roomActivityController.stream;
  Stream<bool> get connectionStream => _connectionController.stream;
  bool get isConnected => _isConnected;

  void connect(String userId) {
    if (_socket != null) {
      disconnect();
    }

    _currentUserId = userId;

    _socket = io.io(
      ApiConstants.socketUrl,
      io.OptionBuilder()
          .setTransports(['websocket'])
          .enableAutoConnect()
          .enableReconnection()
          .setReconnectionAttempts(5)
          .setReconnectionDelay(1000)
          .build(),
    );

    _setupEventHandlers();
  }

  void _setupEventHandlers() {
    _socket?.onConnect((_) {
      _isConnected = true;
      _connectionController.add(true);
      debugPrint('Socket connected');

      if (_currentUserId != null) {
        _socket?.emit('authenticate', {'userId': _currentUserId});
      }
    });

    _socket?.onDisconnect((_) {
      _isConnected = false;
      _connectionController.add(false);
      debugPrint('Socket disconnected');
    });

    _socket?.onConnectError((error) {
      debugPrint('Socket connection error: $error');
      _isConnected = false;
      _connectionController.add(false);
    });

    // Chat messages
    _socket?.on('newMessage', (data) {
      try {
        final message = ChatMessage.fromJson(data);
        _messageController.add(message);
      } catch (e) {
        debugPrint('Error parsing message: $e');
      }
    });

    // Notifications
    _socket?.on('notification', (data) {
      _notificationController.add(Map<String, dynamic>.from(data));
    });

    // Room activity
    _socket?.on('roomActivity', (data) {
      _roomActivityController.add(Map<String, dynamic>.from(data));
    });
  }

  void joinConversation(String conversationId) {
    _socket?.emit('joinConversation', {'conversationId': conversationId});
  }

  void leaveConversation(String conversationId) {
    _socket?.emit('leaveConversation', {'conversationId': conversationId});
  }

  void sendMessage(String conversationId, String content, String senderId) {
    _socket?.emit('sendMessage', {
      'conversationId': conversationId,
      'content': content,
      'senderId': senderId,
    });
  }

  void joinRoom(String roomId) {
    _socket?.emit('joinRoom', {'roomId': roomId});
  }

  void leaveRoom(String roomId) {
    _socket?.emit('leaveRoom', {'roomId': roomId});
  }

  void addEventListener(String event, SocketEventCallback callback) {
    _eventListeners.putIfAbsent(event, () => []);
    _eventListeners[event]!.add(callback);

    _socket?.on(event, (data) {
      callback(data);
    });
  }

  void removeEventListener(String event, SocketEventCallback callback) {
    _eventListeners[event]?.remove(callback);
    _socket?.off(event);
  }

  void disconnect() {
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
    _isConnected = false;
    _currentUserId = null;
  }

  void dispose() {
    disconnect();
    _messageController.close();
    _notificationController.close();
    _roomActivityController.close();
    _connectionController.close();
    _eventListeners.clear();
  }
}
