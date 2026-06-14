import 'package:dio/dio.dart';

import 'endpoints.dart';
import '../storage/secure_storage.dart';

class DioClient {
  static final Dio dio = Dio(
    BaseOptions(
      baseUrl: Endpoints.baseUrl,
      headers: {'Content-Type': 'application/json'},
    ),
  );

  static bool _interceptorsAdded = false;

  static Future<void> ensureInitialized() async {
    if (_interceptorsAdded) return;
    _interceptorsAdded = true;

    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await SecureStorage.getToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
        onError: (error, handler) {
          if (error.response?.statusCode == 401) {
            SecureStorage.clearAll();
          }
          handler.next(error);
        },
      ),
    );
  }
}
