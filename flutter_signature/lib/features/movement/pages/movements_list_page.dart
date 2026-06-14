import 'dart:async';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/storage/secure_storage.dart';
import '../../../core/services/sse_service.dart';
import '../../../core/api/endpoints.dart';
import '../../qr/models/qr_payload.dart';
import '../models/movement_model.dart';
import '../services/movement_service.dart';
import 'movement_detail_page.dart';

class MovementsListPage extends StatefulWidget {
  const MovementsListPage({super.key});

  @override
  State<MovementsListPage> createState() => _MovementsListPageState();
}

class _MovementsListPageState extends State<MovementsListPage> {
  final service = MovementService();
  List<MovementModel> movements = [];
  bool loading = true;
  String? error;
  StreamSubscription? _sseSubscription;

  @override
  void initState() {
    super.initState();
    _loadMovements();
    _setupSSE();
  }

  @override
  void dispose() {
    _sseSubscription?.cancel();
    super.dispose();
  }

  void _setupSSE() {
    _sseSubscription = SseService().movementStream.listen((event) {
      debugPrint("[SSE Mobile UI] Movement change detected. Reloading...");
      _loadMovements();
    });
  }

  Future<void> _showReportOptions() async {
    final option = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF0F172A),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: Color(0xFF334155)),
        ),
        title: const Text(
          "Reporte de Traslados PDF",
          style: TextStyle(color: Color(0xFFF8FAFC), fontWeight: FontWeight.bold),
        ),
        content: const Text(
          "Seleccione si desea exportar el listado completo o filtrar por fechas.",
          style: TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, "ALL"),
            child: const Text("Todo", style: TextStyle(color: Color(0xFF818CF8))),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, "DATE"),
            child: const Text("Filtrar Fechas", style: TextStyle(color: Color(0xFF818CF8))),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, "CANCEL"),
            child: const Text("Cancelar", style: TextStyle(color: Color(0xFFEF4444))),
          ),
        ],
      ),
    );

    if (option == "ALL") {
      _triggerPdfLaunch(null, null);
    } else if (option == "DATE") {
      if (!mounted) return;
      final range = await showDateRangePicker(
        context: context,
        firstDate: DateTime(2025),
        lastDate: DateTime(2030),
        builder: (context, child) {
          return Theme(
            data: Theme.of(context).copyWith(
              colorScheme: const ColorScheme.dark(
                primary: Color(0xFF6366F1),
                onPrimary: Colors.white,
                surface: Color(0xFF0F172A),
                onSurface: Color(0xFFF8FAFC),
              ),
            ),
            child: child!,
          );
        },
      );
      if (range != null) {
        _triggerPdfLaunch(range.start, range.end);
      }
    }
  }

  Future<void> _triggerPdfLaunch(DateTime? start, DateTime? end) async {
    final token = await SecureStorage.getToken();
    if (token == null) return;

    String url = "${Endpoints.baseUrl}/movimientos/reporte?token=$token&_cb=${DateTime.now().millisecondsSinceEpoch}";
    if (start != null && end != null) {
      final startStr = start.toIso8601String().split('T')[0];
      final endStr = end.toIso8601String().split('T')[0];
      url += "&fecha_inicio=$startStr&fecha_fin=$endStr";
    }

    final uri = Uri.parse(url);
    if (!await launchUrl(uri, mode: LaunchMode.externalApplication)) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('No se pudo abrir el reporte PDF')),
        );
      }
    }
  }

  Future<void> _downloadIndividualPdf(MovementModel m) async {
    final token = await SecureStorage.getToken();
    if (token == null) return;

    final url = "${Endpoints.baseUrl}/movimientos/${m.id}/reporte?token=$token&_cb=${DateTime.now().millisecondsSinceEpoch}";
    final uri = Uri.parse(url);
    if (!await launchUrl(uri, mode: LaunchMode.externalApplication)) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('No se pudo abrir el contrato en PDF')),
        );
      }
    }
  }

  Future<void> _loadMovements() async {
    try {
      final list = await service.findAll();
      if (!mounted) return;
      setState(() {
        movements = list;
        loading = false;
        error = null;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        error = 'Error al cargar traslados';
        loading = false;
      });
    }
  }

  void _navigateToDetail(MovementModel m) {
    // Determinar dinámicamente si falta firmar emisor o receptor
    final String step;
    if (m.firmaEmisor == null || m.firmaEmisor!.isEmpty) {
      step = 'emisor';
    } else {
      step = 'receptor';
    }

    final payload = QrPayload(
      movementId: m.id,
      contractId: m.contratoUuid ?? '',
      step: step,
    );

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => MovementDetailPage(payload: payload),
      ),
    ).then((_) {
      // Recargar la lista al volver por si se firmó el movimiento
      setState(() => loading = true);
      _loadMovements();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF020617), // slate-950
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A), // slate-900
        title: const Text(
          'Contratos / Traslados',
          style: TextStyle(
            color: Color(0xFFF8FAFC), // slate-50
            fontWeight: FontWeight.bold,
            letterSpacing: 0.5,
          ),
        ),
        automaticallyImplyLeading: false,
        actions: [
          TextButton(
            onPressed: () => _showReportOptions(),
            child: const Text(
              'Reporte',
              style: TextStyle(
                color: Color(0xFFC7D2FE), // indigo-200
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
            ),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text(
              'Atrás',
              style: TextStyle(
                color: Color(0xFF818CF8), // indigo-400
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
            ),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadMovements,
        color: const Color(0xFF6366F1), // indigo-500
        backgroundColor: const Color(0xFF0F172A),
        child: loading
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
                : movements.isEmpty
                    ? const Center(
                        child: Text(
                          'No hay traslados asignados',
                          style: TextStyle(color: Color(0xFF94A3B8), fontSize: 16),
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: movements.length,
                        itemBuilder: (context, index) {
                          final m = movements[index];
                          final isCompleted = m.estadoMovimientoId == 2;
                          final isEmisorSigned = m.firmaEmisor != null && m.firmaEmisor!.isNotEmpty;

                          String customStatusText = 'PENDIENTE EMISOR';
                          Color statusBg = const Color(0xFF78350F); // amber-900
                          Color statusText = const Color(0xFFFDE68A); // amber-200

                          if (isCompleted) {
                            customStatusText = 'COMPLETADO';
                            statusBg = const Color(0xFF064E3B); // emerald-950
                            statusText = const Color(0xFFA7F3D0); // emerald-200
                          } else if (isEmisorSigned) {
                            customStatusText = 'PENDIENTE RECEPTOR';
                            statusBg = const Color(0xFF1E3A8A); // blue-950
                            statusText = const Color(0xFFBFDBFE); // blue-200
                          }

                          return InkWell(
                            onTap: () => _navigateToDetail(m),
                            borderRadius: BorderRadius.circular(16),
                            child: Container(
                              margin: const EdgeInsets.only(bottom: 12),
                              decoration: BoxDecoration(
                                gradient: const LinearGradient(
                                  colors: [
                                    Color(0xFF1E293B), // slate-800
                                    Color(0xFF0F172A), // slate-900
                                  ],
                                  begin: Alignment.topLeft,
                                  end: Alignment.bottomRight,
                                ),
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(
                                  color: const Color(0xFF334155), // slate-700
                                  width: 1,
                                ),
                              ),
                              child: Padding(
                                padding: const EdgeInsets.all(16),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                          decoration: BoxDecoration(
                                            color: const Color(0xFF1E1B4B), // indigo-950
                                            borderRadius: BorderRadius.circular(8),
                                            border: Border.all(
                                              color: const Color(0xFF3730A3), // indigo-800
                                              width: 1,
                                            ),
                                          ),
                                          child: Text(
                                            m.codigoMovimiento,
                                            style: const TextStyle(
                                              color: Color(0xFFC7D2FE), // indigo-200
                                              fontFamily: 'monospace',
                                              fontWeight: FontWeight.bold,
                                              fontSize: 12,
                                            ),
                                          ),
                                        ),
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                          decoration: BoxDecoration(
                                            color: statusBg,
                                            borderRadius: BorderRadius.circular(8),
                                          ),
                                          child: Text(
                                            customStatusText,
                                            style: TextStyle(
                                              color: statusText,
                                              fontSize: 9,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 12),
                                    Text(
                                      m.activoNombre ?? 'Activo sin nombre',
                                      style: const TextStyle(
                                        color: Color(0xFFF8FAFC),
                                        fontSize: 17,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    const SizedBox(height: 8),
                                    // Trayecto
                                    Container(
                                      padding: const EdgeInsets.all(12),
                                      decoration: BoxDecoration(
                                        color: const Color(0x80020617), // slate-950 con opacidad del 50%
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: Column(
                                        children: [
                                          Row(
                                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                            children: [
                                              const Text(
                                                'DESDE:',
                                                style: TextStyle(
                                                  color: Color(0xFF64748B),
                                                  fontSize: 9,
                                                  fontWeight: FontWeight.bold,
                                                ),
                                              ),
                                              Text(
                                                m.lugarOrigenNombre ?? '?',
                                                style: const TextStyle(
                                                  color: Color(0xFFE2E8F0),
                                                  fontSize: 12,
                                                  fontWeight: FontWeight.w500,
                                                ),
                                              ),
                                            ],
                                          ),
                                          const SizedBox(height: 6),
                                          Row(
                                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                            children: [
                                              const Text(
                                                'HACIA:',
                                                style: TextStyle(
                                                  color: Color(0xFF818CF8),
                                                  fontSize: 9,
                                                  fontWeight: FontWeight.bold,
                                                ),
                                              ),
                                              Text(
                                                m.lugarDestinoNombre ?? '?',
                                                style: const TextStyle(
                                                  color: Color(0xFFE2E8F0),
                                                  fontSize: 12,
                                                  fontWeight: FontWeight.w500,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ],
                                      ),
                                    ),
                                    if (m.contratoUuid != null && m.contratoUuid!.isNotEmpty) ...[
                                      const SizedBox(height: 12),
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          TextButton(
                                            onPressed: () => _downloadIndividualPdf(m),
                                            style: TextButton.styleFrom(
                                              padding: EdgeInsets.zero,
                                              minimumSize: const Size(0, 30),
                                              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                            ),
                                            child: const Text(
                                              'CONTRATO PDF',
                                              style: TextStyle(
                                                color: Color(0xFF818CF8),
                                                fontWeight: FontWeight.bold,
                                                fontSize: 11,
                                              ),
                                            ),
                                          ),
                                          Text(
                                            'Contrato: ${m.contratoUuid!.substring(0, 8)}...',
                                            style: const TextStyle(
                                              color: Color(0xFF475569), // slate-600
                                              fontSize: 10,
                                              fontFamily: 'monospace',
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ],
                                ),
                              ),
                            ),
                          );
                        },
                      ),
      ),
    );
  }
}
