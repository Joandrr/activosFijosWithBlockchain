import 'package:flutter/material.dart';

import '../../qr/models/qr_payload.dart';
import '../../signature/pages/signature_page.dart';
import '../models/movement_model.dart';
import '../services/movement_service.dart';

class MovementDetailPage extends StatefulWidget {
  final QrPayload payload;

  const MovementDetailPage({super.key, required this.payload});

  @override
  State<MovementDetailPage> createState() => _MovementDetailPageState();
}

class _MovementDetailPageState extends State<MovementDetailPage> {
  final service = MovementService();
  MovementModel? movement;
  bool loading = true;
  String? error;

  @override
  void initState() {
    super.initState();
    _loadMovement();
  }

  Future<void> _loadMovement() async {
    try {
      final m = await service.findById(widget.payload.movementId);
      if (!mounted) return;
      setState(() {
        movement = m;
        loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        error = 'Error al cargar movimiento';
        loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Detalle del Movimiento')),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : error != null
              ? Center(child: Text(error!))
              : _buildContent(),
    );
  }

  Widget _buildContent() {
    final m = movement!;
    final canSignEmisor = !m.emisorSigned;
    final canSignReceptor = m.emisorSigned && !m.receptorSigned;

    final isEmisorStep = widget.payload.step == 'emisor';
    final canSign = isEmisorStep ? canSignEmisor : canSignReceptor;

    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _infoRow('Código', m.codigoMovimiento),
          _infoRow('Activo', m.activoNombre ?? '---'),
          _infoRow('Origen', m.lugarOrigenNombre ?? '---'),
          _infoRow('Destino', m.lugarDestinoNombre ?? '---'),
          _infoRow('Estado', m.estadoMovimientoNombre ?? '---'),
          _infoRow('Contrato', m.contratoUuid ?? '---'),
          const SizedBox(height: 8),
          _statusBadge('Emisor', m.emisorSigned),
          _statusBadge('Receptor', m.receptorSigned),
          const Spacer(),
          if (canSign)
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () => Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => SignaturePage(
                      movementId: widget.payload.movementId,
                      step: widget.payload.step,
                    ),
                  ),
                ),
                icon: const Icon(Icons.draw),
                label: Text('Firmar como ${isEmisorStep ? "Emisor" : "Receptor"}'),
              ),
            )
          else if (m.receptorSigned)
            const Center(
              child: Text('Movimiento completado', style: TextStyle(color: Colors.green, fontSize: 18)),
            )
          else if (isEmisorStep && m.emisorSigned)
            const Center(
              child: Text('Firma de emisor registrada, esperando firma del receptor'),
            )
          else
            const Center(
              child: Text('El emisor debe firmar primero'),
            ),
        ],
      ),
    );
  }

  Widget _infoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 80,
            child: Text('$label:', style: const TextStyle(fontWeight: FontWeight.bold)),
          ),
          Expanded(child: Text(value)),
        ],
      ),
    );
  }

  Widget _statusBadge(String label, bool signed) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        children: [
          Icon(signed ? Icons.check_circle : Icons.pending, size: 18, color: signed ? Colors.green : Colors.orange),
          const SizedBox(width: 8),
          Text('$label: ${signed ? "Firmado" : "Pendiente"}'),
        ],
      ),
    );
  }
}
