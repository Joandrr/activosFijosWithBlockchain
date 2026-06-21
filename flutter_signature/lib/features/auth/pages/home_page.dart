import 'package:flutter/material.dart';

import '../../../core/storage/secure_storage.dart';
import '../../../core/services/sse_service.dart';
import '../../movement/pages/assets_page.dart';
import '../../movement/pages/movements_list_page.dart';
import '../../qr/pages/qr_scanner_page.dart';
import '../repositories/auth_repository.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final repository = AuthRepository();
  bool loading = true;
  String userName = '';
  String userRoleName = '';
  int userRolId = 0;

  @override
  void initState() {
    super.initState();
    _loadUser();
  }

  Future<void> _loadUser() async {
    final data = await SecureStorage.getUserData();
    final int rolId = int.tryParse(data['rol_id'] ?? '0') ?? 0;

    String rName = 'Usuario';
    if (rolId == 1) {
      rName = 'Administrador';
    } else if (rolId == 2) {
      rName = 'Auxiliar de Laboratorio';
    } else if (rolId == 3) {
      rName = 'Administrativo';
    } else if (rolId == 4) {
      rName = 'Jefe de Centro Interno';
    }

    // Connect to SSE for real-time updates
    SseService().connect();

    if (mounted) {
      setState(() {
        userName = '${data['nombre'] ?? ''} ${data['apellido'] ?? ''}';
        userRoleName = rName;
        userRolId = rolId;
        loading = false;
      });
    }
  }

  Future<void> _logout() async {
    SseService().disconnect();
    await repository.logout();
    if (!mounted) return;
    Navigator.pushReplacementNamed(context, '/');
  }

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return const Scaffold(
        backgroundColor: Color(0xFF020617), // slate-950
        body: Center(
          child: CircularProgressIndicator(
            valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF6366F1)),
          ),
        ),
      );
    }

    final isAdmin = userRolId == 1;

    return Scaffold(
      backgroundColor: const Color(0xFF020617), // slate-950
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Welcome Header
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [
                      Color(0xFF1E1B4B), // indigo-950
                      Color(0xFF0F172A), // slate-900
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(
                    color: const Color(0xFF312E81), // indigo-900
                    width: 1,
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'SESIÓN ACTIVA',
                      style: TextStyle(
                        color: Color(0xFF818CF8), // indigo-400
                        fontWeight: FontWeight.bold,
                        fontSize: 10,
                        letterSpacing: 1.5,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      userName,
                      style: const TextStyle(
                        color: Color(0xFFF8FAFC), // slate-50
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      userRoleName,
                      style: const TextStyle(
                        color: Color(0xFF94A3B8), // slate-400
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),

              const Text(
                'MÓDULOS DE GESTIÓN',
                style: TextStyle(
                  color: Color(0xFF475569), // slate-600
                  fontWeight: FontWeight.bold,
                  fontSize: 11,
                  letterSpacing: 1.5,
                ),
              ),
              const SizedBox(height: 16),

              Expanded(
                child: ListView(
                  children: [
                    // MÓDULO DE ACTIVOS (Solo Admin)
                    if (isAdmin) ...[
                      _buildDashboardCard(
                        title: 'Inventario de Activos',
                        description: 'Consulta y catálogo general de los activos fijos registrados en el sistema.',
                        gradientColors: [
                          const Color(0xFF1E293B), // slate-800
                          const Color(0xFF0F172A), // slate-900
                        ],
                        borderColor: const Color(0xFF334155),
                        textColor: const Color(0xFFF8FAFC),
                        onTap: () => Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const AssetsPage()),
                        ),
                      ),
                      const SizedBox(height: 16),
                    ],

                    // MÓDULO DE MOVIMIENTOS / CONTRATOS (Todos)
                    _buildDashboardCard(
                      title: isAdmin ? 'Contratos y Traslados' : 'Bandeja de Firmas',
                      description: isAdmin
                          ? 'Historial de movimientos, bitácoras de blockchain y firmas de traslados.'
                          : 'Consulta tus traslados asignados y realiza la firma criptográfica manual de forma directa.',
                      gradientColors: [
                        const Color(0xFF312E81), // indigo-950
                        const Color(0xFF1E1B4B), // indigo-900
                      ],
                      borderColor: const Color(0xFF4338CA), // indigo-700
                      textColor: const Color(0xFFE0E7FF), // indigo-100
                      onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const MovementsListPage()),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // ESCANEAR QR (Todos)
                    _buildDashboardCard(
                      title: 'Escanear QR de Notaría',
                      description: 'Escanea el código QR directamente desde la pantalla web para firmar un traslado rápidamente.',
                      gradientColors: [
                        const Color(0xFF0F172A), // slate-900
                        const Color(0xFF020617), // slate-950
                      ],
                      borderColor: const Color(0xFF1E293B),
                      textColor: const Color(0xFF94A3B8),
                      onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const QrScannerPage()),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // ASISTENTE DE AYUDA / CHATBOT (Todos)
                    _buildDashboardCard(
                      title: 'Asistente de Ayuda (AI)',
                      description: 'Consulta cómo realizar firmas, busca información en el dataset de 10k activos fijos, y obtén soporte instantáneo.',
                      gradientColors: [
                        const Color(0xFF3B0764), // purple-950
                        const Color(0xFF1E1B4B), // indigo-950
                      ],
                      borderColor: const Color(0xFF6B21A8), // purple-800
                      textColor: const Color(0xFFF3E8FF), // purple-100
                      onTap: () => Navigator.pushNamed(context, '/chatbot'),
                    ),
                  ],
                ),
              ),

              // Botón de salir
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: TextButton(
                  onPressed: _logout,
                  style: TextButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                      side: const BorderSide(color: Color(0xFFEF4444), width: 1), // red-500
                    ),
                  ),
                  child: const Text(
                    'Cerrar Sesión',
                    style: TextStyle(
                      color: Color(0xFFEF4444),
                      fontWeight: FontWeight.bold,
                      fontSize: 15,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDashboardCard({
    required String title,
    required String description,
    required List<Color> gradientColors,
    required Color borderColor,
    required Color textColor,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(24),
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: gradientColors,
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: borderColor,
            width: 1,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: TextStyle(
                color: textColor,
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              description,
              style: const TextStyle(
                color: Color(0xFF94A3B8), // slate-400
                fontSize: 13,
                height: 1.4,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
