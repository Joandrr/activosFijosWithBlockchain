import 'dart:async';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/storage/secure_storage.dart';
import '../../../core/services/sse_service.dart';
import '../../../core/api/endpoints.dart';
import '../models/asset_model.dart';
import '../services/asset_service.dart';

class AssetsPage extends StatefulWidget {
  const AssetsPage({super.key});

  @override
  State<AssetsPage> createState() => _AssetsPageState();
}

class _AssetsPageState extends State<AssetsPage> {
  final service = AssetService();
  List<AssetModel> assets = [];
  bool loading = true;
  String? error;
  bool isAdmin = false;
  StreamSubscription? _sseSubscription;

  @override
  void initState() {
    super.initState();
    _loadAssets();
    _setupSSE();
  }

  @override
  void dispose() {
    _sseSubscription?.cancel();
    super.dispose();
  }

  void _setupSSE() {
    _sseSubscription = SseService().assetStream.listen((event) {
      debugPrint("[SSE Mobile UI] Assets change detected. Reloading...");
      _loadAssets();
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
          "Exportar Reporte PDF",
          style: TextStyle(color: Color(0xFFF8FAFC), fontWeight: FontWeight.bold),
        ),
        content: const Text(
          "Seleccione si desea exportar el inventario completo o filtrar por fechas.",
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

    String url = "${Endpoints.baseUrl}/activos/reporte?token=$token&_cb=${DateTime.now().millisecondsSinceEpoch}";
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

  Future<void> _downloadIndividualPdf(AssetModel asset) async {
    final token = await SecureStorage.getToken();
    if (token == null) return;

    final url = "${Endpoints.baseUrl}/activos/${asset.id}/reporte?token=$token&_cb=${DateTime.now().millisecondsSinceEpoch}";
    final uri = Uri.parse(url);
    if (!await launchUrl(uri, mode: LaunchMode.externalApplication)) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('No se pudo abrir la ficha PDF del activo')),
        );
      }
    }
  }

  Future<void> _loadAssets() async {
    try {
      final data = await SecureStorage.getUserData();
      final int rolId = int.tryParse(data['rol_id'] ?? '0') ?? 0;
      final list = await service.findAll();
      if (!mounted) return;
      setState(() {
        isAdmin = rolId == 1;
        assets = list;
        loading = false;
        error = null;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        error = 'Error al cargar activos';
        loading = false;
      });
    }
  }

  Future<void> _confirmDecommission(AssetModel asset) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          backgroundColor: const Color(0xFF0F172A), // slate-900
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
            side: const BorderSide(color: Color(0xFF334155), width: 1), // slate-700
          ),
          title: const Text(
            'Confirmar Baja',
            style: TextStyle(
              color: Color(0xFFF8FAFC), // slate-50
              fontWeight: FontWeight.bold,
            ),
          ),
          content: Text(
            '¿Está seguro de dar de baja el activo "${asset.nombre}"?',
            style: const TextStyle(
              color: Color(0xFF94A3B8), // slate-400
              fontSize: 14,
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text(
                'Cancelar',
                style: TextStyle(
                  color: Color(0xFF64748B), // slate-500
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            TextButton(
              onPressed: () => Navigator.pop(context, true),
              child: const Text(
                'Confirmar',
                style: TextStyle(
                  color: Color(0xFFEF4444), // red-500
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        );
      },
    );

    if (confirmed == true) {
      setState(() {
        loading = true;
      });
      try {
        final success = await service.decommission(asset.id);
        if (success) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text(
                  'Activo dado de baja correctamente',
                  style: TextStyle(color: Color(0xFFF8FAFC), fontWeight: FontWeight.bold),
                ),
                backgroundColor: Color(0xFF1E293B),
              ),
            );
          }
        } else {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text(
                  'Error al dar de baja el activo',
                  style: TextStyle(color: Color(0xFFF8FAFC), fontWeight: FontWeight.bold),
                ),
                backgroundColor: Color(0xFF7F1D1D),
              ),
            );
          }
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                'Error: ${e.toString()}',
                style: const TextStyle(color: Color(0xFFF8FAFC), fontWeight: FontWeight.bold),
              ),
              backgroundColor: const Color(0xFF7F1D1D),
            ),
          );
        }
      } finally {
        _loadAssets();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF020617), // slate-950
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A), // slate-900
        title: const Text(
          'Activos del Sistema',
          style: TextStyle(
            color: Color(0xFFF8FAFC), // slate-50
            fontWeight: FontWeight.bold,
            letterSpacing: 0.5,
          ),
        ),
        automaticallyImplyLeading: false, // Quitar botón de retroceso por defecto (para evitar icono)
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
        onRefresh: _loadAssets,
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
                : assets.isEmpty
                    ? const Center(
                        child: Text(
                          'No hay activos registrados',
                          style: TextStyle(color: Color(0xFF94A3B8), fontSize: 16),
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: assets.length,
                        itemBuilder: (context, index) {
                          final asset = assets[index];
                          return Container(
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
                                          color: const Color(0xFF312E81), // indigo-950
                                          borderRadius: BorderRadius.circular(8),
                                          border: Border.all(
                                            color: const Color(0xFF4338CA), // indigo-700
                                            width: 1,
                                          ),
                                        ),
                                        child: Text(
                                          asset.codigoActivo,
                                          style: const TextStyle(
                                            color: Color(0xFFC7D2FE), // indigo-200
                                            fontFamily: 'monospace',
                                            fontWeight: FontWeight.bold,
                                            fontSize: 12,
                                          ),
                                        ),
                                      ),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: asset.estado
                                              ? const Color(0xFF064E3B) // emerald-950
                                              : const Color(0xFF7F1D1D), // red-950
                                          borderRadius: BorderRadius.circular(8),
                                        ),
                                        child: Text(
                                          asset.estado ? 'DISPONIBLE' : 'DE BAJA',
                                          style: TextStyle(
                                            color: asset.estado
                                                ? const Color(0xFFA7F3D0) // emerald-200
                                                : const Color(0xFFFECACA), // red-200
                                            fontSize: 10,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 12),
                                  Text(
                                    asset.nombre,
                                    style: const TextStyle(
                                      color: Color(0xFFF8FAFC),
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  if (asset.descripcion != null && asset.descripcion!.isNotEmpty) ...[
                                    const SizedBox(height: 4),
                                    Text(
                                      asset.descripcion!,
                                      style: const TextStyle(
                                        color: Color(0xFF94A3B8), // slate-400
                                        fontSize: 13,
                                      ),
                                    ),
                                  ],
                                  const SizedBox(height: 16),
                                  Row(
                                    children: [
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            const Text(
                                              'UBICACIÓN',
                                              style: TextStyle(
                                                color: Color(0xFF64748B), // slate-500
                                                fontSize: 10,
                                                fontWeight: FontWeight.bold,
                                                letterSpacing: 0.5,
                                              ),
                                            ),
                                            const SizedBox(height: 2),
                                            Text(
                                              asset.lugarNombre ?? 'Sin ubicación',
                                              style: const TextStyle(
                                                color: Color(0xFFE2E8F0),
                                                fontSize: 13,
                                                fontWeight: FontWeight.w500,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            const Text(
                                              'TIPO / MARCA',
                                              style: TextStyle(
                                                color: Color(0xFF64748B),
                                                fontSize: 10,
                                                fontWeight: FontWeight.bold,
                                                letterSpacing: 0.5,
                                              ),
                                            ),
                                            const SizedBox(height: 2),
                                            Text(
                                              '${asset.tipoNombre ?? "?"} / ${asset.marcaNombre ?? "?"}',
                                              style: const TextStyle(
                                                color: Color(0xFFE2E8F0),
                                                fontSize: 13,
                                                fontWeight: FontWeight.w500,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 16),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      TextButton(
                                        onPressed: () => _downloadIndividualPdf(asset),
                                        style: TextButton.styleFrom(
                                          padding: EdgeInsets.zero,
                                          minimumSize: const Size(0, 30),
                                          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                        ),
                                        child: const Text(
                                          'DESCARGAR PDF',
                                          style: TextStyle(
                                            color: Color(0xFF818CF8), // indigo-400
                                            fontWeight: FontWeight.bold,
                                            fontSize: 12,
                                          ),
                                        ),
                                      ),
                                      if (isAdmin && asset.estado)
                                        TextButton(
                                          onPressed: () => _confirmDecommission(asset),
                                          style: TextButton.styleFrom(
                                            padding: EdgeInsets.zero,
                                            minimumSize: const Size(0, 30),
                                            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                          ),
                                          child: const Text(
                                            'DAR DE BAJA',
                                            style: TextStyle(
                                              color: Color(0xFFEF4444), // red-500
                                              fontWeight: FontWeight.bold,
                                              fontSize: 12,
                                            ),
                                          ),
                                        ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
      ),
    );
  }
}
