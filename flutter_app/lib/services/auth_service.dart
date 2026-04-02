import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/user.dart';
import '../core/constants/app_constants.dart';
import 'api_service.dart';
import 'storage_service.dart';

class AuthResult {
  final bool ok;
  final String? token;
  final User? user;
  final String? error;

  AuthResult({required this.ok, this.token, this.user, this.error});
}

class AuthService {
  final ApiService _apiService;
  final StorageService _storageService;

  AuthService(this._apiService, this._storageService);

  Future<AuthResult> register({
    required String email,
    required String password,
    required String name,
    String? collegeId,
    String? department,
    int? graduationYear,
  }) async {
    try {
      final response = await _apiService.post(
        ApiConstants.register,
        data: {
          'email': email,
          'password': password,
          'name': name,
          'collegeId': collegeId,
          'department': department,
          'graduationYear': graduationYear,
        },
      );

      if (response.data['ok'] == true) {
        final token = response.data['token'];
        final user = User.fromJson(response.data['user']);

        await _storageService.setToken(token);
        _apiService.setAuthToken(token);
        await _storageService.setUserData(jsonEncode(user.toJson()));

        return AuthResult(ok: true, token: token, user: user);
      }

      return AuthResult(
        ok: false,
        error: response.data['error'] ?? 'Registration failed',
      );
    } catch (e) {
      debugPrint('Register error: $e');
      return AuthResult(ok: false, error: 'Network error. Please try again.');
    }
  }

  Future<AuthResult> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _apiService.post(
        ApiConstants.login,
        data: {'email': email, 'password': password},
      );

      if (response.data['ok'] == true) {
        final token = response.data['token'];
        final user = User.fromJson(response.data['user']);

        await _storageService.setToken(token);
        _apiService.setAuthToken(token);
        await _storageService.setUserData(jsonEncode(user.toJson()));

        return AuthResult(ok: true, token: token, user: user);
      }

      return AuthResult(
        ok: false,
        error: response.data['error'] ?? 'Invalid credentials',
      );
    } catch (e) {
      debugPrint('Login error: $e');
      return AuthResult(ok: false, error: 'Network error. Please try again.');
    }
  }

  Future<AuthResult> sendOtp(String email) async {
    try {
      final response = await _apiService.post(
        ApiConstants.sendOtp,
        data: {'email': email},
      );

      if (response.data['ok'] == true) {
        return AuthResult(ok: true);
      }

      return AuthResult(
        ok: false,
        error: response.data['error'] ?? 'Failed to send OTP',
      );
    } catch (e) {
      debugPrint('Send OTP error: $e');
      return AuthResult(ok: false, error: 'Network error. Please try again.');
    }
  }

  Future<AuthResult> verifyOtp(String email, String code) async {
    try {
      final response = await _apiService.post(
        ApiConstants.verifyOtp,
        data: {'email': email, 'code': code},
      );

      if (response.data['ok'] == true) {
        return AuthResult(ok: true);
      }

      return AuthResult(
        ok: false,
        error: response.data['error'] ?? 'Invalid OTP',
      );
    } catch (e) {
      debugPrint('Verify OTP error: $e');
      return AuthResult(ok: false, error: 'Network error. Please try again.');
    }
  }

  Future<User?> getCurrentUser() async {
    try {
      final userData = await _storageService.getUserData();
      if (userData != null) {
        return User.fromJson(jsonDecode(userData));
      }
      return null;
    } catch (e) {
      debugPrint('Get current user error: $e');
      return null;
    }
  }

  Future<bool> isLoggedIn() async {
    final token = await _storageService.getToken();
    return token != null;
  }

  Future<void> logout() async {
    await _storageService.clearAll();
    _apiService.setAuthToken(null);
  }

  Future<AuthResult> updateProfile({
    String? name,
    String? username,
    String? bio,
    String? avatar,
    String? department,
    int? graduationYear,
  }) async {
    try {
      final response = await _apiService.put(
        ApiConstants.updateUser,
        data: {
          if (name != null) 'name': name,
          if (username != null) 'username': username,
          if (bio != null) 'bio': bio,
          if (avatar != null) 'avatar': avatar,
          if (department != null) 'department': department,
          if (graduationYear != null) 'graduationYear': graduationYear,
        },
      );

      if (response.data['ok'] == true) {
        final user = User.fromJson(response.data['user']);
        await _storageService.setUserData(jsonEncode(user.toJson()));
        return AuthResult(ok: true, user: user);
      }

      return AuthResult(
        ok: false,
        error: response.data['error'] ?? 'Update failed',
      );
    } catch (e) {
      debugPrint('Update profile error: $e');
      return AuthResult(ok: false, error: 'Network error. Please try again.');
    }
  }

  Future<AuthResult> verifyCollegeId({
    required String institution,
    required String collegeId,
  }) async {
    try {
      final response = await _apiService.post(
        ApiConstants.verifyCollegeId,
        data: {
          'institution': institution,
          'collegeId': collegeId,
        },
      );

      if (response.data['ok'] == true) {
        final user = await getCurrentUser();
        return AuthResult(ok: true, user: user);
      }

      return AuthResult(
        ok: false,
        error: response.data['error'] ?? 'Verification failed',
      );
    } catch (e) {
      debugPrint('Verify college ID error: $e');
      return AuthResult(ok: false, error: 'Network error. Please try again.');
    }
  }
}

// Auth State
enum AuthStatus { initial, loading, authenticated, unauthenticated, error }

class AuthState {
  final AuthStatus status;
  final User? user;
  final String? error;

  const AuthState({this.status = AuthStatus.initial, this.user, this.error});

  AuthState copyWith({AuthStatus? status, User? user, String? error}) {
    return AuthState(
      status: status ?? this.status,
      user: user ?? this.user,
      error: error,
    );
  }
}

// Auth Notifier
class AuthNotifier extends StateNotifier<AuthState> {
  final AuthService _authService;

  AuthNotifier(this._authService) : super(const AuthState());

  Future<void> checkAuthStatus() async {
    state = state.copyWith(status: AuthStatus.loading);

    final isLoggedIn = await _authService.isLoggedIn();
    if (isLoggedIn) {
      final user = await _authService.getCurrentUser();
      if (user != null) {
        state = state.copyWith(status: AuthStatus.authenticated, user: user);
      } else {
        state = state.copyWith(status: AuthStatus.unauthenticated);
      }
    } else {
      state = state.copyWith(status: AuthStatus.unauthenticated);
    }
  }

  Future<bool> login(String email, String password) async {
    state = state.copyWith(status: AuthStatus.loading);

    final result = await _authService.login(email: email, password: password);

    if (result.ok) {
      state = state.copyWith(
        status: AuthStatus.authenticated,
        user: result.user,
      );
      return true;
    } else {
      state = state.copyWith(status: AuthStatus.error, error: result.error);
      return false;
    }
  }

  Future<bool> register({
    required String email,
    required String password,
    required String name,
    String? collegeId,
    String? department,
    int? graduationYear,
  }) async {
    state = state.copyWith(status: AuthStatus.loading);

    final result = await _authService.register(
      email: email,
      password: password,
      name: name,
      collegeId: collegeId,
      department: department,
      graduationYear: graduationYear,
    );

    if (result.ok) {
      state = state.copyWith(
        status: AuthStatus.authenticated,
        user: result.user,
      );
      return true;
    } else {
      state = state.copyWith(status: AuthStatus.error, error: result.error);
      return false;
    }
  }

  Future<void> logout() async {
    await _authService.logout();
    state = state.copyWith(status: AuthStatus.unauthenticated, user: null);
  }

  Future<bool> updateProfile({
    String? name,
    String? username,
    String? bio,
    String? avatar,
    String? department,
    int? graduationYear,
  }) async {
    final result = await _authService.updateProfile(
      name: name,
      username: username,
      bio: bio,
      avatar: avatar,
      department: department,
      graduationYear: graduationYear,
    );

    if (result.ok && result.user != null) {
      state = state.copyWith(user: result.user);
      return true;
    }
    return false;
  }
}
