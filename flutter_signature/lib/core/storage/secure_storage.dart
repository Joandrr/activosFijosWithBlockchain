import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStorage {
  static const _storage = FlutterSecureStorage();
  static const _tokenKey = 'jwt_token';
  static const _userIdKey = 'user_id';
  static const _userNameKey = 'user_name';
  static const _userLastNameKey = 'user_last_name';
  static const _userEmailKey = 'user_email';
  static const _userRolIdKey = 'user_rol_id';

  static Future<void> saveToken(String token) async {
    await _storage.write(key: _tokenKey, value: token);
  }

  static Future<String?> getToken() async {
    return await _storage.read(key: _tokenKey);
  }

  static Future<void> deleteToken() async {
    await _storage.delete(key: _tokenKey);
  }

  static Future<void> saveUserData({
    required int id,
    required String name,
    required String lastName,
    required String email,
    required int rolId,
  }) async {
    await _storage.write(key: _userIdKey, value: id.toString());
    await _storage.write(key: _userNameKey, value: name);
    await _storage.write(key: _userLastNameKey, value: lastName);
    await _storage.write(key: _userEmailKey, value: email);
    await _storage.write(key: _userRolIdKey, value: rolId.toString());
  }

  static Future<Map<String, String?>> getUserData() async {
    return {
      'id': await _storage.read(key: _userIdKey),
      'nombre': await _storage.read(key: _userNameKey),
      'apellido': await _storage.read(key: _userLastNameKey),
      'email': await _storage.read(key: _userEmailKey),
      'rol_id': await _storage.read(key: _userRolIdKey),
    };
  }

  static Future<void> clearAll() async {
    await _storage.deleteAll();
  }
}
