import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter_client_sse/flutter_client_sse.dart';
import 'package:flutter_client_sse/constants/sse_request_type_enum.dart';
import '../api/endpoints.dart';
import '../storage/secure_storage.dart';

class SseService {
  static final SseService _instance = SseService._internal();
  factory SseService() => _instance;
  SseService._internal();

  StreamSubscription? _subscription;
  
  // Streams controllers to notify the UI reactively
  final _assetController = StreamController<Map<String, dynamic>>.broadcast();
  final _movementController = StreamController<Map<String, dynamic>>.broadcast();

  Stream<Map<String, dynamic>> get assetStream => _assetController.stream;
  Stream<Map<String, dynamic>> get movementStream => _movementController.stream;

  bool _isConnected = false;
  bool get isConnected => _isConnected;

  Future<void> connect() async {
    if (_isConnected) return;

    final token = await SecureStorage.getToken();
    if (token == null) {
      debugPrint("[SSE Mobile] No token found. Skipping connection.");
      return;
    }

    try {
      debugPrint("[SSE Mobile] Connecting to stream...");
      final url = "${Endpoints.baseUrl}/realtime/stream?token=$token";

      _subscription = SSEClient.subscribeToSSE(
        method: SSERequestType.GET,
        url: url,
        header: {
          "Accept": "text/event-stream",
          "Cache-Control": "no-cache",
        },
      ).listen(
        (SSEModel event) {
          _isConnected = true;
          debugPrint("[SSE Mobile] Event received: ${event.event}");
          
          if (event.event == 'activo_cambiado') {
            _assetController.add({'event': event.event, 'data': event.data});
          } else if (event.event == 'movimiento_cambiado') {
            _movementController.add({'event': event.event, 'data': event.data});
          }
        },
        onError: (err) {
          debugPrint("[SSE Mobile] Connection error: $err");
          _isConnected = false;
          // Retry connection after 5 seconds
          Future.delayed(const Duration(seconds: 5), () => connect());
        },
        onDone: () {
          debugPrint("[SSE Mobile] Stream completed / closed.");
          _isConnected = false;
        },
      );
    } catch (e) {
      debugPrint("[SSE Mobile] Error initializing SSE: $e");
      _isConnected = false;
    }
  }

  void disconnect() {
    _subscription?.cancel();
    _subscription = null;
    _isConnected = false;
    debugPrint("[SSE Mobile] Disconnected.");
  }
}
