import '../../../core/api/dio_client.dart';
import '../../../core/api/endpoints.dart';
import '../models/movement_model.dart';

class MovementService {
  Future<List<MovementModel>> findAll() async {
    final response = await DioClient.dio.get(Endpoints.movimientos);
    final body = response.data;
    if (body['ok'] != true || body['data'] == null) return [];
    final list = body['data'] as List;
    return list.map((e) => MovementModel.fromJson(e)).toList();
  }

  Future<MovementModel?> findById(int id) async {
    final response = await DioClient.dio.get(Endpoints.movimientoById(id));
    final body = response.data;
    if (body['ok'] != true || body['data'] == null) return null;
    return MovementModel.fromJson(body['data']);
  }
}
