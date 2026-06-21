import 'package:flutter/material.dart';
import '../../../core/services/dataset_service.dart';

class Message {
  final String sender;
  final String text;
  final DateTime timestamp;
  final List<DatasetAsset> assetResult;
  final List<String> suggestions;

  Message({
    required this.sender,
    required this.text,
    required this.timestamp,
    this.assetResult = const [],
    this.suggestions = const [],
  });
}

class ChatbotPage extends StatefulWidget {
  const ChatbotPage({super.key});

  @override
  State<ChatbotPage> createState() => _ChatbotPageState();
}

class _ChatbotPageState extends State<ChatbotPage> {
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final List<Message> _messages = [];

  @override
  void initState() {
    super.initState();
    _sendWelcomeMessage();
  }

  void _sendWelcomeMessage() {
    setState(() {
      _messages.add(Message(
        sender: 'bot',
        text: '🤖 **¡Hola! Soy tu asistente de Activos FICCT.**\n\n¿En qué te puedo ayudar hoy? Puedes hacerme preguntas sobre los flujos del sistema o buscar en nuestro dataset de **10,000 activos fijos**.',
        timestamp: DateTime.now(),
        suggestions: [
          '¿Cómo registro un activo?',
          '¿Cómo funciona la firma dual?',
          'Buscar proyector Epson',
          '¿Cómo doy de baja?',
        ],
      ));
    });
  }

  void _handleSend(String text) {
    if (text.trim().isEmpty) return;

    setState(() {
      _messages.add(Message(
        sender: 'user',
        text: text,
        timestamp: DateTime.now(),
      ));
    });
    _controller.clear();
    _scrollToBottom();

    // Simulate bot thinking
    Future.delayed(const Duration(milliseconds: 400), () {
      final response = _processBotResponse(text);
      if (mounted) {
        setState(() {
          _messages.add(response);
        });
        _scrollToBottom();
      }
    });
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Message _processBotResponse(String query) {
    final q = query.toLowerCase().trim();
    final cleanSearch = q
        .replaceAll(RegExp(r'(como|cómo|se|un|una|el|la|los|las|de|en|para|donde|dónde|está|esta|quien|quién|hacer|que|qué|buscar|find|finds)'), '')
        .trim();

    // Intents mapping
    String matchedIntent = '';
    int maxScore = 0;

    final intents = {
      'saludo': ['hola', 'buen', 'dia', 'día', 'tarde', 'noche', 'saludos', 'asistente', 'quien', 'quién', 'ayuda', 'ayúdame', 'que haces', 'qué haces'],
      'registro': ['registrar', 'registro', 'crear', 'nuevo', 'alta', 'agregar', 'adicionar', 'guardar', 'insertar', 'subir', 'ingresar', 'ficha', 'incorporar'],
      'baja': ['baja', 'eliminar', 'borrar', 'quitar', 'desincorporar', 'desactivar', 'retirar', 'obsoleto', 'dañado', 'daño', 'perdido', 'pérdida'],
      'traslado': ['firma', 'firmar', 'qr', 'doble', 'traslado', 'movimiento', 'mover', 'transferir', 'aprobar', 'autorizar', 'recepcion', 'recepción', 'salida', 'entrada', 'emisor', 'receptor', 'enviar', 'despachar', 'recibir'],
      'integridad': ['validar', 'validador', 'auditar', 'auditoria', 'auditoría', 'blockchain', 'ledger', 'dynamodb', 'sello', 'hash', 'cripto', 'criptográfico', 'verificar', 'verificación', 'seguridad', 'integro', 'integridad', 'contrato', 'uuid'],
      'usuarios': ['usuario', 'usuarios', 'rol', 'roles', 'permiso', 'permisos', 'personal', 'empleado', 'administrador', 'auxiliar', 'jefe', 'receptor', 'administrativo', 'cuentas'],
    };

    intents.forEach((key, keywords) {
      int score = 0;
      for (var kw in keywords) {
        if (q.contains(kw)) {
          score++;
        }
      }
      if (score > maxScore) {
        maxScore = score;
        matchedIntent = key;
      }
    });

    List<DatasetAsset> datasetResults = [];
    if (cleanSearch.length >= 2) {
      datasetResults = DatasetService.searchDataset(cleanSearch);
    }

    String responseText = '';
    List<String> suggestions = [];

    if (maxScore > 0 && matchedIntent.isNotEmpty) {
      switch (matchedIntent) {
        case 'saludo':
          responseText = '👋 ¡Hola! Soy tu **Asistente Virtual de Activos FICCT**.\n\nPuedo guiarte en los flujos principales (**alta, baja y traslados**) o buscar entre los **10,000 activos** del dataset.\n\n¿De qué te gustaría hablar o qué equipo deseas buscar?';
          suggestions = ['¿Cómo registro un activo?', '¿Cómo doy de baja?', 'Buscar activo Lenovo'];
          break;
        case 'registro':
          responseText = '📝 **Registrar Activo (Alta):**\n\n1. En la web, ve a la sección **Activos**.\n2. Presiona **"+ Nuevo Activo"**.\n3. Llena el Código, Nombre, Ubicación y Tipo.\n4. Presiona **"Crear Activo"**.\n\n🔒 Esto generará el **Sello Digital** y guardará el contrato en el ledger inmutable de DynamoDB.';
          suggestions = ['¿Cómo doy de baja?', 'Verificar integridad'];
          break;
        case 'baja':
          responseText = '🗑️ **Dar de Baja un Activo:**\n\n1. Ve a **Activos** en la web.\n2. Busca el activo y presiona el icono de basurero (**"Dar de baja"**).\n3. Confirma la acción.\n\n⚠️ Esto cambia el estado del bien permanentemente y se sella la baja en DynamoDB.';
          suggestions = ['¿Cómo registro un activo?', 'Buscar activo Mikrotik'];
          break;
        case 'traslado':
          responseText = '✍️ **Flujo de Firma Dual para Traslados:**\n\n1. **Emisión:** Crea el movimiento en **Movimientos** -> **+ Nuevo Movimiento**.\n2. **Salida:** En el *Panel Firmas*, presiona *Firmar Emisor* o escanea el **QR Paso 1** con esta app móvil.\n3. **Entrada:** El receptor abre el *Panel Firmas* y presiona *Firmar Receptor* (o escanea el **QR Paso 2** con su móvil).\n4. **Ejecutado:** Al registrarse ambas firmas, el traslado se completa y actualiza la ubicación del activo.';
          suggestions = ['Buscar traslado en dataset', 'Verificar validador'];
          break;
        case 'integridad':
          responseText = '🛡️ **Integridad y Validador Notarial:**\n\nPara auditar que los datos de PostgreSQL no hayan sido manipulados:\n1. Copia el **UUID de Contrato** de la ficha del activo o movimiento.\n2. Abre el **Validador Notarial**.\n3. Pega el UUID y presiona **"Auditar Contrato"**.\n4. Si los datos coinciden con DynamoDB, saldrá en verde: **Verificado**.';
          suggestions = ['Buscar activo HP', '¿Cómo funciona la firma dual?'];
          break;
        case 'usuarios':
          responseText = '👥 **Roles y Permisos:**\n\n- **Administrador:** Altas, bajas, marcas y usuarios.\n- **Auxiliar:** Crea traslados y firma salidas (Emisor).\n- **Administrativo / Jefe de Centro:** Firma recepciones en destino (Receptor).';
          suggestions = ['¿Cómo funciona la firma dual?', 'Buscar proyector Epson'];
          break;
      }

      if (datasetResults.isNotEmpty) {
        responseText += '\n\n🔍 *Activos relacionados en el inventario (${datasetResults.length}):*';
      }
    } else {
      if (datasetResults.isNotEmpty) {
        responseText = '🔍 Encontré **${datasetResults.length} coincidencias** en el dataset para *"$cleanSearch"*:';
        suggestions = ['¿Cómo se traslada un activo?', 'Verificar integridad'];
      } else {
        responseText = '💡 Hola, no he detectado una consulta sobre un flujo específico.\n\n*Puedes preguntarme sobre:*\n- *"¿Cómo dar de alta un activo?"*\n- *"¿Cómo firmar un traslado?"*\n- *"¿Cómo funciona el validador?"*\n\nO busca en los **10,000 activos** del dataset escribiendo palabras clave como: **"buscar Dell"**, **"buscar Aula 101"** o códigos como **"ACT-COM-0005"**.';
        suggestions = ['Buscar proyector Epson', '¿Cómo registro un activo?', '¿Cómo funciona la firma dual?'];
      }
    }

    return Message(
      sender: 'bot',
      text: responseText,
      timestamp: DateTime.now(),
      assetResult: datasetResults,
      suggestions: suggestions,
    );
  }

  List<InlineSpan> _parseText(String text) {
    final List<InlineSpan> spans = [];
    final parts = text.split(RegExp(r'(\*\*[^*]+\*\*)'));
    
    for (var part in parts) {
      if (part.startsWith('**') && part.endsWith('**')) {
        spans.add(TextSpan(
          text: part.substring(2, part.length - 2),
          style: const TextStyle(
            fontWeight: FontWeight.bold,
            color: Color(0xFF818CF8), // indigo-400
          ),
        ));
      } else {
        final subParts = part.split(RegExp(r'(\*[^*]+\*)'));
        for (var subPart in subParts) {
          if (subPart.startsWith('*') && subPart.endsWith('*')) {
            spans.add(TextSpan(
              text: subPart.substring(1, subPart.length - 1),
              style: const TextStyle(
                fontStyle: FontStyle.italic,
                color: Color(0xFF94A3B8), // slate-400
                backgroundColor: Color(0x1F94A3B8),
              ),
            ));
          } else {
            spans.add(TextSpan(text: subPart));
          }
        }
      }
    }
    return spans;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF020617), // slate-950
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A), // slate-900
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Asistente Virtual FICCT',
              style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
            ),
            Text(
              'Offline AI · 10,000 registros',
              style: TextStyle(color: Color(0xFF10B981), fontSize: 10, fontWeight: FontWeight.w500),
            ),
          ],
        ),
        iconTheme: const IconThemeData(color: Colors.white),
        elevation: 0,
      ),
      body: Column(
        children: [
          // Message List
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final msg = _messages[index];
                final isUser = msg.sender == 'user';

                return Column(
                  crossAxisAlignment: isUser ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (!isUser) ...[
                          Container(
                            margin: const EdgeInsets.only(right: 8, top: 4),
                            width: 32,
                            height: 32,
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(
                                colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)],
                              ),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Center(
                              child: Text(
                                'AF',
                                style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11),
                              ),
                            ),
                          ),
                        ],
                        Flexible(
                          child: Container(
                            margin: const EdgeInsets.symmetric(vertical: 4),
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: isUser ? const Color(0xFF4F46E5) : const Color(0xFF0F172A),
                              borderRadius: BorderRadius.only(
                                topLeft: const Radius.circular(16),
                                topRight: const Radius.circular(16),
                                bottomLeft: isUser ? const Radius.circular(16) : Radius.zero,
                                bottomRight: isUser ? Radius.zero : const Radius.circular(16),
                              ),
                              border: isUser
                                  ? null
                                  : Border.all(color: const Color(0xFF1E293B), width: 1),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                RichText(
                                  text: TextSpan(
                                    style: const TextStyle(
                                      color: Color(0xFFE2E8F0),
                                      fontSize: 13,
                                      height: 1.5,
                                      fontFamily: 'sans-serif',
                                    ),
                                    children: _parseText(msg.text),
                                  ),
                                ),
                                if (msg.assetResult.isNotEmpty) ...[
                                  const SizedBox(height: 12),
                                  ...msg.assetResult.map((asset) => _buildAssetCard(asset)),
                                ],
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                    if (msg.suggestions.isNotEmpty) ...[
                      Padding(
                        padding: const EdgeInsets.only(left: 40, top: 8, bottom: 8),
                        child: Wrap(
                          spacing: 8,
                          runSpacing: 4,
                          children: msg.suggestions.map((sug) {
                            return InkWell(
                              onTap: () => _handleSend(sug),
                              borderRadius: BorderRadius.circular(20),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                decoration: BoxDecoration(
                                  color: const Color(0x1F6366F1),
                                  border: Border.all(color: const Color(0x3D6366F1)),
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Text(
                                  sug,
                                  style: const TextStyle(
                                    color: Color(0xFF818CF8),
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                      )
                    ],
                    const SizedBox(height: 8),
                  ],
                );
              },
            ),
          ),
          // Input area
          Container(
            padding: const EdgeInsets.all(12),
            decoration: const BoxDecoration(
              color: Color(0xFF0F172A),
              border: Border(
                top: BorderSide(color: Color(0xFF1E293B), width: 1),
              ),
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    style: const TextStyle(color: Colors.white, fontSize: 13),
                    decoration: InputDecoration(
                      hintText: 'Pregunta o busca un activo (Dell, Lenovo)...',
                      hintStyle: const TextStyle(color: Color(0xFF475569), fontSize: 13),
                      fillColor: const Color(0xFF020617),
                      filled: true,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(24),
                        borderSide: BorderSide.none,
                      ),
                    ),
                    onSubmitted: _handleSend,
                  ),
                ),
                const SizedBox(width: 8),
                InkWell(
                  onTap: () => _handleSend(_controller.text),
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: const Color(0xFF4F46E5),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(
                      Icons.send,
                      color: Colors.white,
                      size: 18,
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

  Widget _buildAssetCard(DatasetAsset asset) {
    bool isBaja = asset.estado == 'De Baja';
    bool isGood = asset.estado == 'Excelente' || asset.estado == 'Bueno';

    return Container(
      margin: const EdgeInsets.only(top: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF020617),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF1E293B)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                asset.codigo,
                style: const TextStyle(color: Color(0xFF818CF8), fontSize: 11, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: const Color(0x1F818CF8),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  asset.tipo,
                  style: const TextStyle(color: Color(0xFF818CF8), fontSize: 8, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            asset.nombre,
            style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          _buildCardDetail(Icons.branding_watermark, 'Marca: ${asset.marca}'),
          _buildCardDetail(Icons.location_on, 'Ubicación: ${asset.ubicacion}'),
          _buildCardDetail(Icons.person, 'Responsable: ${asset.responsable}'),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: isGood
                      ? const Color(0x1F10B981)
                      : isBaja
                          ? const Color(0x1FEF4444)
                          : const Color(0x1F3B82F6),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isGood
                        ? const Color(0xFF10B981)
                        : isBaja
                            ? const Color(0xFFEF4444)
                            : const Color(0xFF3B82F6),
                    width: 0.5,
                  ),
                ),
                child: Text(
                  asset.estado,
                  style: TextStyle(
                    color: isGood
                        ? const Color(0xFF10B981)
                        : isBaja
                            ? const Color(0xFFEF4444)
                            : const Color(0xFF3B82F6),
                    fontSize: 8,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              Text(
                '${asset.selloDigital.substring(0, 12)}...',
                style: const TextStyle(color: Color(0xFF475569), fontSize: 9, fontFamily: 'monospace'),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCardDetail(IconData icon, String text) {
    return Padding(
      padding: const EdgeInsets.only(top: 2),
      child: Row(
        children: [
          Icon(icon, color: const Color(0xFF475569), size: 12),
          const SizedBox(width: 4),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 10),
            ),
          ),
        ],
      ),
    );
  }
}
