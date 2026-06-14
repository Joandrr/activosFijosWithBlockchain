import 'package:onesignal_flutter/onesignal_flutter.dart';

import '../models/user_model.dart';
import '../../../core/api/dio_client.dart';
import '../../../core/api/endpoints.dart';
import '../../../core/storage/secure_storage.dart';

class AuthService {
  Future<UserModel?> login({
    required String email,
    required String password,
  }) async {
    await DioClient.ensureInitialized();

    final response = await DioClient.dio.post(
      Endpoints.login,
      data: {'email': email, 'password': password},
    );

    final body = response.data;
    if (body['ok'] != true || body['data'] == null) {
      return null;
    }

    final data = body['data'];
    final userData = data['user'] as Map<String, dynamic>;
    final token = data['token'] as String;

    final user = UserModel.fromJson(userData, token);

    await SecureStorage.saveToken(token);
    await SecureStorage.saveUserData(
      id: user.id,
      name: user.nombre,
      lastName: user.apellido,
      email: user.email,
      rolId: user.rolId,
    );

    await OneSignal.login(user.id.toString());

    return user;
  }

  Future<void> logout() async {
    await OneSignal.logout();
    await SecureStorage.clearAll();
  }
}
