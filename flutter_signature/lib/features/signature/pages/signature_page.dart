import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:signature/signature.dart';

import '../../../core/api/dio_client.dart';
import '../../../core/api/endpoints.dart';

class SignaturePage extends StatefulWidget {
  final int movementId;
  final String step;

  const SignaturePage({
    super.key,
    required this.movementId,
    required this.step,
  });

  @override
  State<SignaturePage> createState() => _SignaturePageState();
}

class _SignaturePageState extends State<SignaturePage> {
  final controller = SignatureController();
  bool sending = false;

  Future<void> sendSignature() async {
    final png = await controller.toPngBytes();
    if (png == null) return;

    setState(() => sending = true);

    final base64 = base64Encode(png);
    final endpoint = widget.step == 'emisor'
        ? Endpoints.signEmisor(widget.movementId)
        : Endpoints.signReceptor(widget.movementId);

    try {
      await DioClient.dio.post(endpoint, data: {'signature': base64});
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Firma enviada correctamente')),
      );
      Navigator.pop(context);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Error al enviar la firma')),
      );
    } finally {
      if (mounted) setState(() => sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF020617), // slate-950
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A), // slate-900
        title: const Text(
          'Firma Digital',
          style: TextStyle(
            color: Color(0xFFF8FAFC),
            fontWeight: FontWeight.bold,
            letterSpacing: 0.5,
          ),
        ),
        automaticallyImplyLeading: false,
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text(
              'Atrás',
              style: TextStyle(
                color: Color(0xFF818CF8),
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: Container(
              color: const Color(0xFF0F172A),
              child: Signature(
                controller: controller,
                backgroundColor: const Color(0xFF0F172A),
              ),
            ),
          ),
          if (sending)
            const LinearProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF6366F1)),
            ),
          Container(
            color: const Color(0xFF020617),
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            child: Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: sending ? null : () => controller.clear(),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xFFEF4444),
                      side: const BorderSide(color: Color(0xFFEF4444)),
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: const Text(
                      'Limpiar',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: sending ? null : sendSignature,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF4F46E5), // indigo-600
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      elevation: 0,
                    ),
                    child: const Text(
                      'Confirmar',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
