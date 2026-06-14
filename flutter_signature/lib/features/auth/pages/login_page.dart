import 'package:flutter/material.dart';
import '../repositories/auth_repository.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final emailCtrl = TextEditingController();
  final passwordCtrl = TextEditingController();
  final repository = AuthRepository();
  bool loading = false;
  String? errorMessage;

  Future<void> login() async {
    if (emailCtrl.text.isEmpty || passwordCtrl.text.isEmpty) {
      setState(() => errorMessage = 'Todos los campos son requeridos');
      return;
    }

    setState(() {
      loading = true;
      errorMessage = null;
    });

    try {
      final user = await repository.login(
        email: emailCtrl.text.trim(),
        password: passwordCtrl.text,
      );

      if (!mounted) return;

      if (user != null) {
        Navigator.pushReplacementNamed(context, '/home');
      } else {
        setState(() => errorMessage = 'Credenciales incorrectas');
      }
    } catch (e) {
      if (!mounted) return;
      setState(() => errorMessage = 'Error de conexión con el servidor');
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF020617), // slate-950
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Branding Header
                Center(
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: const Color(0x4D312E81), // indigo-950 / 30%
                      borderRadius: BorderRadius.circular(30),
                      border: Border.all(
                        color: const Color(0x664338CA), // indigo-700 / 40%
                        width: 1,
                      ),
                    ),
                    child: const Text(
                      'SECURE LEDGER SYSTEM',
                      style: TextStyle(
                        color: Color(0xFF818CF8), // indigo-400
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.5,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                const Center(
                  child: Text(
                    'Notaría Digital',
                    style: TextStyle(
                      color: Color(0xFFF8FAFC), // slate-50
                      fontSize: 32,
                      fontWeight: FontWeight.w900,
                      letterSpacing: -0.5,
                    ),
                  ),
                ),
                const Center(
                  child: Text(
                    'Activos Fijos & Blockchain',
                    style: TextStyle(
                      color: Color(0xFF64748B), // slate-500
                      fontSize: 15,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
                const SizedBox(height: 40),

                // Glassmorphism Card
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: const Color(0xCC0F172A), // slate-900 / 80%
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(
                      color: const Color(0xFF1E293B), // slate-800
                      width: 1.5,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0x0D6366F1), // indigo-500 / 5%
                        blurRadius: 40,
                        spreadRadius: 5,
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'INGRESO AL SISTEMA',
                        style: TextStyle(
                          color: Color(0xFF94A3B8), // slate-400
                          fontWeight: FontWeight.bold,
                          fontSize: 11,
                          letterSpacing: 1.2,
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Error Box
                      if (errorMessage != null) ...[
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: const Color(0x337F1D1D), // red-950 / 20%
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: const Color(0x66B91C1C), // red-700 / 40%
                              width: 1,
                            ),
                          ),
                          child: Text(
                            errorMessage!,
                            style: const TextStyle(
                              color: Color(0xFFFECACA), // red-200
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                        const SizedBox(height: 20),
                      ],

                      // Email Field
                      const Text(
                        'Correo Electrónico',
                        style: TextStyle(
                          color: Color(0xFFE2E8F0),
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 8),
                      TextField(
                        controller: emailCtrl,
                        keyboardType: TextInputType.emailAddress,
                        style: const TextStyle(color: Color(0xFFF8FAFC), fontSize: 15),
                        decoration: InputDecoration(
                          hintText: 'ejemplo@ficct.edu.bo',
                          hintStyle: const TextStyle(color: Color(0xFF475569)),
                          filled: true,
                          fillColor: const Color(0xFF020617), // slate-950
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(16),
                            borderSide: const BorderSide(color: Color(0xFF334155)),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(16),
                            borderSide: const BorderSide(color: Color(0xFF1E293B)),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(16),
                            borderSide: const BorderSide(color: Color(0xFF6366F1), width: 1.5),
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),

                      // Password Field
                      const Text(
                        'Contraseña',
                        style: TextStyle(
                          color: Color(0xFFE2E8F0),
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 8),
                      TextField(
                        controller: passwordCtrl,
                        obscureText: true,
                        style: const TextStyle(color: Color(0xFFF8FAFC), fontSize: 15),
                        decoration: InputDecoration(
                          hintText: '••••••••',
                          hintStyle: const TextStyle(color: Color(0xFF475569)),
                          filled: true,
                          fillColor: const Color(0xFF020617),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(16),
                            borderSide: const BorderSide(color: Color(0xFF334155)),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(16),
                            borderSide: const BorderSide(color: Color(0xFF1E293B)),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(16),
                            borderSide: const BorderSide(color: Color(0xFF6366F1), width: 1.5),
                          ),
                        ),
                      ),
                      const SizedBox(height: 32),

                      // Login Button
                      SizedBox(
                        width: double.infinity,
                        height: 52,
                        child: ElevatedButton(
                          onPressed: loading ? null : login,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF4F46E5), // indigo-600
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                            elevation: 0,
                          ),
                          child: loading
                              ? const SizedBox(
                                  height: 20,
                                  width: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2.5,
                                    valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                  ),
                                )
                              : const Text(
                                  'INGRESAR',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 15,
                                    letterSpacing: 1,
                                  ),
                                ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                const Center(
                  child: Text(
                    'Exclusivo para personal administrativo y auxiliares.',
                    style: TextStyle(
                      color: Color(0xFF475569),
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
