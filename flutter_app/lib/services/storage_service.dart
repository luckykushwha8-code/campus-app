import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../core/constants/app_constants.dart';

class StorageService {
  late final SharedPreferences _prefs;
  late final FlutterSecureStorage _secureStorage;

  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
    _secureStorage = const FlutterSecureStorage();
  }

  // Token Management
  Future<void> setToken(String token) async {
    await _secureStorage.write(key: AppConstants.tokenKey, value: token);
  }

  Future<String?> getToken() async {
    return await _secureStorage.read(key: AppConstants.tokenKey);
  }

  Future<void> removeToken() async {
    await _secureStorage.delete(key: AppConstants.tokenKey);
  }

  Future<void> setRefreshToken(String token) async {
    await _secureStorage.write(key: AppConstants.refreshTokenKey, value: token);
  }

  Future<String?> getRefreshToken() async {
    return await _secureStorage.read(key: AppConstants.refreshTokenKey);
  }

  Future<void> removeRefreshToken() async {
    await _secureStorage.delete(key: AppConstants.refreshTokenKey);
  }

  // User Data
  Future<void> setUserData(String userJson) async {
    await _prefs.setString(AppConstants.userKey, userJson);
  }

  Future<String?> getUserData() async {
    return _prefs.getString(AppConstants.userKey);
  }

  Future<void> removeUserData() async {
    await _prefs.remove(AppConstants.userKey);
  }

  // Theme
  Future<void> setTheme(String theme) async {
    await _prefs.setString(AppConstants.themeKey, theme);
  }

  String? getTheme() {
    return _prefs.getString(AppConstants.themeKey);
  }

  // Clear All
  Future<void> clearAll() async {
    await _secureStorage.deleteAll();
    await _prefs.clear();
  }
}
