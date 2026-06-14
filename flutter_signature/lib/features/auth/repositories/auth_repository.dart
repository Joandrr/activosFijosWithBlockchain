import '../models/user_model.dart';
import '../services/auth_service.dart';

class AuthRepository {
  final AuthService _service = AuthService();

  Future<UserModel?> login({
    required String email,
    required String password,
  }) {
    return _service.login(email: email, password: password);
  }

  Future<void> logout() => _service.logout();
}
