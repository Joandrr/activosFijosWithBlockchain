class MovementModel {
  final int id;
  final String codigoMovimiento;
  final String? fechaMovimiento;
  final String? observaciones;
  final int? estadoMovimientoId;
  final String? estadoMovimientoNombre;
  final int? activoId;
  final String? activoNombre;
  final String? lugarOrigenNombre;
  final String? lugarDestinoNombre;
  final String? usuarioNombre;
  final String? contratoUuid;
  final String? firmaEmisor;
  final String? firmaReceptor;

  MovementModel({
    required this.id,
    required this.codigoMovimiento,
    this.fechaMovimiento,
    this.observaciones,
    this.estadoMovimientoId,
    this.estadoMovimientoNombre,
    this.activoId,
    this.activoNombre,
    this.lugarOrigenNombre,
    this.lugarDestinoNombre,
    this.usuarioNombre,
    this.contratoUuid,
    this.firmaEmisor,
    this.firmaReceptor,
  });

  bool get emisorSigned => firmaEmisor != null && firmaEmisor!.isNotEmpty;
  bool get receptorSigned => firmaReceptor != null && firmaReceptor!.isNotEmpty;

  factory MovementModel.fromJson(Map<String, dynamic> json) {
    return MovementModel(
      id: json['id'] ?? 0,
      codigoMovimiento: json['codigo_movimiento'] ?? '',
      fechaMovimiento: json['fecha_movimiento'],
      observaciones: json['observaciones'],
      estadoMovimientoId: json['estado_movimiento_id'],
      estadoMovimientoNombre: json['estado_movimiento_nombre'],
      activoId: json['activo_id'],
      activoNombre: json['activo_nombre'],
      lugarOrigenNombre: json['lugar_origen_nombre'],
      lugarDestinoNombre: json['lugar_destino_nombre'],
      usuarioNombre: json['usuario_nombre'],
      contratoUuid: json['contrato_uuid'],
      firmaEmisor: json['firma_emisor'],
      firmaReceptor: json['firma_receptor'],
    );
  }
}
