import '../models/qr_payload.dart';

class QrParserService {
  static QrPayload? parse(String qr) {
    try {
      final uri = Uri.parse(qr);
      final idStr = uri.queryParameters['id'];
      final contract = uri.queryParameters['contract'];
      final step = uri.queryParameters['step'];

      if (idStr == null || contract == null || step == null) return null;
      if (step != 'emisor' && step != 'receptor') return null;

      final id = int.tryParse(idStr);
      if (id == null) return null;

      return QrPayload(
        movementId: id,
        contractId: contract,
        step: step,
      );
    } catch (_) {
      return null;
    }
  }
}
