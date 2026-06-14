import 'package:flutter/material.dart';

import '../../../core/storage/secure_storage.dart';
import '../../movement/models/movement_model.dart';
import '../../movement/services/movement_service.dart';
import '../../qr/pages/qr_scanner_page.dart';
import '../repositories/auth_repository.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final repository = AuthRepository();
  final movementService = MovementService();
  List<MovementModel> movements = [];
  bool loading = true;
  String userName = '';

  @override
  void initState() {
    super.initState();
    _loadUser();
    _loadMovements();
  }

  Future<void> _loadUser() async {
    final data = await SecureStorage.getUserData();
    if (mounted) {
      setState(() => userName = '${data['nombre'] ?? ''} ${data['apellido'] ?? ''}');
    }
  }

  Future<void> _loadMovements() async {
    try {
      final list = await movementService.findAll();
      if (!mounted) return;
      setState(() {
        movements = list;
        loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => loading = false);
    }
  }

  Future<void> _logout() async {
    await repository.logout();
    if (!mounted) return;
    Navigator.pushReplacementNamed(context, '/');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(userName.isNotEmpty ? 'Bienvenido, $userName' : 'Home'),
        actions: [
          IconButton(
            icon: const Icon(Icons.qr_code_scanner),
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const QrScannerPage()),
            ),
            tooltip: 'Escanear QR',
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: _logout,
            tooltip: 'Cerrar sesión',
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadMovements,
        child: loading
            ? const Center(child: CircularProgressIndicator())
            : movements.isEmpty
                ? const Center(child: Text('No hay movimientos'))
                : ListView.separated(
                    itemCount: movements.length,
                    separatorBuilder: (_, _) => const Divider(height: 1),
                    itemBuilder: (context, index) {
                      final m = movements[index];
                      return ListTile(
                        leading: Icon(
                          m.estadoMovimientoId == 2 ? Icons.check_circle : Icons.pending,
                          color: m.estadoMovimientoId == 2 ? Colors.green : Colors.orange,
                        ),
                        title: Text(m.codigoMovimiento),
                        subtitle: Text(
                          '${m.activoNombre ?? "---"} | ${m.lugarOrigenNombre ?? "?"} → ${m.lugarDestinoNombre ?? "?"}',
                        ),
                        trailing: Text(m.estadoMovimientoNombre ?? ''),
                        onTap: () => Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => _buildMovementDetailPage(m),
                          ),
                        ),
                      );
                    },
                  ),
      ),
    );
  }

  Widget _buildMovementDetailPage(MovementModel m) {
    return Scaffold(
      appBar: AppBar(title: const Text('Detalle')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Código: ${m.codigoMovimiento}'),
            Text('Activo: ${m.activoNombre ?? "---"}'),
            Text('Origen: ${m.lugarOrigenNombre ?? "---"}'),
            Text('Destino: ${m.lugarDestinoNombre ?? "---"}'),
            Text('Estado: ${m.estadoMovimientoNombre ?? "---"}'),
            const Spacer(),
            if (m.contratoUuid != null)
              Center(
                child: Text('Contrato: ${m.contratoUuid}', style: const TextStyle(fontSize: 12)),
              ),
          ],
        ),
      ),
    );
  }
}
