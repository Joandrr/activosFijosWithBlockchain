class AssetModel {
  final int id;
  final String codigoActivo;
  final String nombre;
  final String? descripcion;
  final bool estado;
  final String? tipoNombre;
  final String? marcaNombre;
  final String? lugarNombre;

  AssetModel({
    required this.id,
    required this.codigoActivo,
    required this.nombre,
    this.descripcion,
    required this.estado,
    this.tipoNombre,
    this.marcaNombre,
    this.lugarNombre,
  });

  factory AssetModel.fromJson(Map<String, dynamic> json) {
    return AssetModel(
      id: json['id'] ?? 0,
      codigoActivo: json['codigo_activo'] ?? '',
      nombre: json['nombre'] ?? '',
      descripcion: json['descripcion'],
      estado: json['estado'] ?? true,
      tipoNombre: json['tipo_nombre'],
      marcaNombre: json['marca_nombre'],
      lugarNombre: json['lugar_nombre'],
    );
  }
}
