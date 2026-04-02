import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'models/user.dart';
import 'services/api_service.dart';
import 'services/storage_service.dart';
import 'services/auth_service.dart';
import 'services/socket_service.dart';

final apiServiceProvider = Provider<ApiService>((ref) {
  return ApiService();
});

final storageServiceProvider = Provider<StorageService>((ref) {
  return StorageService();
});

final authServiceProvider = Provider<AuthService>((ref) {
  final apiService = ref.watch(apiServiceProvider);
  final storageService = ref.watch(storageServiceProvider);
  return AuthService(apiService, storageService);
});

final authNotifierProvider =
    StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final authService = ref.watch(authServiceProvider);
  return AuthNotifier(authService);
});

final currentUserProvider = FutureProvider<User?>((ref) async {
  final authState = ref.watch(authNotifierProvider);
  return authState.user;
});

final socketServiceProvider = Provider<SocketService>((ref) {
  return SocketService();
});
