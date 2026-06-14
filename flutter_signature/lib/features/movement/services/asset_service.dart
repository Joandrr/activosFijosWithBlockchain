import '../../../core/api/dio_client.dart';
import '../../../core/api/endpoints.dart';
import '../models/asset_model.dart';

class AssetService {
  Future<List<AssetModel>> findAll() async {
    final response = await DioClient.dio.get(Endpoints.activos);
    final body = response.data;
    if (body['ok'] != true || body['data'] == null) return [];
    final list = body['data'] as List;
    return list.map((e) => AssetModel.fromJson(e)).toList();
  }

  Future<bool> decommission(int id) async {
    final response = await DioClient.dio.delete('${Endpoints.activos}/$id');
    final body = response.data;
    return body['ok'] == true;
  }
}
