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
      appBar: AppBar(title: const Text('Firma')),
      body: Column(
        children: [
          Expanded(
            child: Signature(controller: controller),
          ),
          if (sending)
            const LinearProgressIndicator(),
          Row(
            children: [
              Expanded(
                child: ElevatedButton(
                  onPressed: sending ? null : () => controller.clear(),
                  child: const Text('Limpiar'),
                ),
              ),
              Expanded(
                child: ElevatedButton(
                  onPressed: sending ? null : sendSignature,
                  child: const Text('Firmar'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
