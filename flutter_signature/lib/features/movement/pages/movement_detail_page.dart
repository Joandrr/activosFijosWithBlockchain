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
        error = null;
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
      backgroundColor: const Color(0xFF020617), // slate-950
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A), // slate-900
        title: const Text(
          'Detalle del Movimiento',
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
      body: loading
          ? const Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF6366F1)),
              ),
            )
          : error != null
              ? Center(
                  child: Text(
                    error!,
                    style: const TextStyle(color: Color(0xFFEF4444), fontSize: 16),
                  ),
                )
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
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Tarjeta de información principal
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [
                  Color(0xFF1E293B), // slate-800
                  Color(0xFF0F172A), // slate-900
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(
                color: const Color(0xFF334155), // slate-700
                width: 1,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _infoRow('Código:', m.codigoMovimiento, isMono: true),
                const Divider(color: Color(0xFF334155), height: 24),
                _infoRow('Activo:', m.activoNombre ?? '---'),
                const SizedBox(height: 8),
                _infoRow('Origen:', m.lugarOrigenNombre ?? '---'),
                const SizedBox(height: 8),
                _infoRow('Destino:', m.lugarDestinoNombre ?? '---'),
                const SizedBox(height: 8),
                _infoRow('Estado:', m.estadoMovimientoNombre ?? '---'),
                if (m.contratoUuid != null && m.contratoUuid!.isNotEmpty) ...[
                  const Divider(color: Color(0xFF334155), height: 24),
                  _infoRow('Contrato:', m.contratoUuid!, isSmallMono: true),
                ],
              ],
            ),
          ),
          const SizedBox(height: 32),

          const Text(
            'ESTADO DE FIRMAS',
            style: TextStyle(
              color: Color(0xFF475569), // slate-600
              fontWeight: FontWeight.bold,
              fontSize: 11,
              letterSpacing: 1.5,
            ),
          ),
          const SizedBox(height: 16),

          _statusBadge('Firma Emisor (Origen)', m.emisorSigned),
          const SizedBox(height: 12),
          _statusBadge('Firma Receptor (Destino)', m.receptorSigned),

          const Spacer(),

          if (canSign)
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => SignaturePage(
                      movementId: widget.payload.movementId,
                      step: widget.payload.step,
                    ),
                  ),
                ).then((_) {
                  setState(() => loading = true);
                  _loadMovement();
                }),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF4F46E5), // indigo-600
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  elevation: 0,
                ),
                child: Text(
                  'Firma Digital de ${isEmisorStep ? "Emisor" : "Receptor"}',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.5,
                  ),
                ),
              ),
            )
          else if (m.receptorSigned)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF064E3B), // emerald-950
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Center(
                child: Text(
                  'TRASLADO COMPLETADO Y EJECUTADO',
                  style: TextStyle(
                    color: Color(0xFFA7F3D0), // emerald-200
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                    letterSpacing: 0.5,
                  ),
                ),
              ),
            )
          else if (isEmisorStep && m.emisorSigned)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF1E3A8A), // blue-950
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Center(
                child: Text(
                  'FIRMA REGISTRADA · ESPERANDO RECEPTOR',
                  style: TextStyle(
                    color: Color(0xFFBFDBFE), // blue-200
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                    letterSpacing: 0.5,
                  ),
                ),
              ),
            )
          else
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF7F1D1D), // red-950
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Center(
                child: Text(
                  'BLOQUEADO · REQUIERE FIRMA DE EMISOR PRIMERO',
                  style: TextStyle(
                    color: Color(0xFFFECACA), // red-200
                    fontWeight: FontWeight.bold,
                    fontSize: 13,
                    letterSpacing: 0.5,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _infoRow(String label, String value, {bool isMono = false, bool isSmallMono = false}) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 90,
          child: Text(
            label,
            style: const TextStyle(
              color: Color(0xFF64748B), // slate-500
              fontWeight: FontWeight.bold,
              fontSize: 13,
            ),
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: TextStyle(
              color: const Color(0xFFF8FAFC),
              fontWeight: FontWeight.bold,
              fontSize: isSmallMono ? 11 : 14,
              fontFamily: (isMono || isSmallMono) ? 'monospace' : null,
            ),
          ),
        ),
      ],
    );
  }

  Widget _statusBadge(String label, bool signed) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A), // slate-900
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: const Color(0xFF1E293B), // slate-800
          width: 1,
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(
              color: Color(0xFFE2E8F0),
              fontWeight: FontWeight.bold,
              fontSize: 14,
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: signed ? const Color(0xFF064E3B) : const Color(0xFF78350F), // emerald-950 / amber-900
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              signed ? 'FIRMADO' : 'PENDIENTE',
              style: TextStyle(
                color: signed ? const Color(0xFFA7F3D0) : const Color(0xFFFDE68A), // emerald-200 / amber-200
                fontSize: 10,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
