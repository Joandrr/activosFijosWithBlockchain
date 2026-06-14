class Endpoints {
  static const baseUrl = 'http://192.168.0.18:3000/api';

  static const login = '/auth/login';
  static const register = '/auth/register';
  static const profile = '/auth/profile';
  static const movimientos = '/movimientos';
  static const movimientosSignEmisor = '/movimientos/{id}/sign-emisor';
  static const movimientosSignReceptor = '/movimientos/{id}/sign-receptor';

  static String signEmisor(int id) => '/movimientos/$id/sign-emisor';
  static String signReceptor(int id) => '/movimientos/$id/sign-receptor';
  static String movimientoById(int id) => '/movimientos/$id';
}
