class UserModel {
  final int id;
  final String nombre;
  final String apellido;
  final String email;
  final String genero;
  final int rolId;
  final bool estado;
  final String token;

  UserModel({
    required this.id,
    required this.nombre,
    required this.apellido,
    required this.email,
    required this.genero,
    required this.rolId,
    required this.estado,
    required this.token,
  });

  String get fullName => '$nombre $apellido';

  factory UserModel.fromJson(Map<String, dynamic> user, String token) {
    return UserModel(
      id: user['id'] ?? 0,
      nombre: user['nombre'] ?? '',
      apellido: user['apellido'] ?? '',
      email: user['email'] ?? '',
      genero: user['genero'] ?? '',
      rolId: user['rol_id'] ?? 0,
      estado: user['estado'] ?? true,
      token: token,
    );
  }
}
