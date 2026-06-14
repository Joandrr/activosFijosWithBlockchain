import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

import '../../movement/pages/movement_detail_page.dart';
import '../services/qr_parser_service.dart';

class QrScannerPage extends StatelessWidget {
  const QrScannerPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Escanear QR')),
      body: MobileScanner(
        onDetect: (capture) {
          final barcode = capture.barcodes.first;
          final value = barcode.rawValue;
          if (value == null) return;

          final payload = QrParserService.parse(value);
          if (payload == null) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('QR inválido')),
            );
            return;
          }

          Navigator.pushReplacement(
            context,
            MaterialPageRoute(
              builder: (_) => MovementDetailPage(payload: payload),
            ),
          );
        },
      ),
    );
  }
}
