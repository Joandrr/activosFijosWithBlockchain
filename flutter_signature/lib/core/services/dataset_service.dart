class DatasetAsset {
  final int id;
  final String codigo;
  final String nombre;
  final String tipo;
  final String marca;
  final String ubicacion;
  final String responsable;
  final String estado;
  final String selloDigital;

  DatasetAsset({
    required this.id,
    required this.codigo,
    required this.nombre,
    required this.tipo,
    required this.marca,
    required this.ubicacion,
    required this.responsable,
    required this.estado,
    required this.selloDigital,
  });
}

class DatasetService {
  static final List<String> _tipos = ["Computación", "Mobiliario", "Redes", "Climatización", "Audiovisual"];
  
  static final Map<String, List<String>> _marcas = {
    "Computación": ["Dell", "HP", "Lenovo", "LG", "Samsung", "Apple"],
    "Mobiliario": ["Hermon", "Muebles FICCT", "MetalMadera", "Díaz Muebles"],
    "Redes": ["Cisco", "MikroTik", "Huawei", "Ubiquiti", "TP-Link"],
    "Climatización": ["Carrier", "Samsung", "LG", "TCL", "Panasonic"],
    "Audiovisual": ["Epson", "JBL", "Sony", "BenQ", "Logitech"],
  };

  static final Map<String, List<String>> _nombres = {
    "Computación": ["Laptop ThinkPad T14", "Computadora EliteDesk", "Monitor UltraSharp 24\"", "Teclado Mecánico Pro", "Mouse Ergonómico", "Impresora Láser LaserJet"],
    "Mobiliario": ["Silla de Oficina Ergonómica", "Escritorio Modular en L", "Mesa para Reuniones 10p", "Estante Metálico 5 Divisiones", "Pizarra Acrílica Blanca"],
    "Redes": ["Router Switch Catalítico", "Switch Administrable 24 Puertos", "Access Point UniFi PRO", "Servidor de Rack PowerEdge", "Modem Fibra Óptica"],
    "Climatización": ["Aire Acondicionado Split 24000 BTU", "Ventilador de Techo Industrial", "Extractor de Aire Turbina"],
    "Audiovisual": ["Proyector Multimedia HD", "Sistema de Sonido Parlante Activo", "Pizarra Interactiva Táctil", "Cámara Web Videoconferencia 4K"],
  };

  static final List<String> _ubicaciones = [
    "Laboratorio de Software",
    "Laboratorio de Redes",
    "Laboratorio de Hardware",
    "Aula 101",
    "Aula 102",
    "Aula 201",
    "Aula 202",
    "Aula 301",
    "Aula 302",
    "Decanato",
    "Dirección de Carrera",
    "Kárdex Académico",
    "Sala de Docentes",
    "Biblioteca Central FICCT",
    "Sala de Servidores (Data Center)",
  ];

  static final List<String> _responsables = [
    "Ing. Juan Carlos Pérez",
    "Ing. María René Delgado",
    "Dr. Carlos Vargas",
    "MSc. Ana Patricia Rocha",
    "Lic. Jorge Mercado",
    "Ing. Silvia Aramayo",
    "Ing. Ricardo Aguilera",
    "Dra. Elizabeth Choque",
  ];

  static final List<String> _estados = ["Excelente", "Bueno", "Regular", "Requiere Mantenimiento"];

  static List<DatasetAsset> _cachedDataset = [];

  static List<DatasetAsset> getDataset() {
    if (_cachedDataset.isNotEmpty) return _cachedDataset;

    final List<DatasetAsset> dataset = [];
    for (int i = 1; i <= 10000; i++) {
      final tipo = _tipos[i % _tipos.length];
      final marcasDisponibles = _marcas[tipo]!;
      final marca = marcasDisponibles[i % marcasDisponibles.length];
      final nombresDisponibles = _nombres[tipo]!;
      final nombreBase = nombresDisponibles[i % nombresDisponibles.length];
      final nombre = "$nombreBase $marca (Mod-${100 + (i % 900)})";

      final ubicacion = _ubicaciones[i % _ubicaciones.length];
      final responsable = _responsables[i % _responsables.length];
      final estado = i % 150 == 0 ? "De Baja" : _estados[i % _estados.length];

      final padNum = i.toString().padLeft(5, '0');
      final codPrefix = tipo.substring(0, 3).toUpperCase();
      final codigo = "ACT-$codPrefix-$padNum";

      final hex = (i * 123456789).toRadixString(16).padRight(12, 'f').substring(0, 12);
      final selloDigital = "3d2b7c4d-ca5e-49b8-a6d1-$hex";

      dataset.add(DatasetAsset(
        id: i,
        codigo: codigo,
        nombre: nombre,
        tipo: tipo,
        marca: marca,
        ubicacion: ubicacion,
        responsable: responsable,
        estado: estado,
        selloDigital: selloDigital,
      ));
    }

    _cachedDataset = dataset;
    return dataset;
  }

  static List<DatasetAsset> searchDataset(String query) {
    final dataset = getDataset();
    final cleanQuery = query.toLowerCase().trim();
    if (cleanQuery.isEmpty) return [];

    return dataset
        .where((item) =>
            item.codigo.toLowerCase().contains(cleanQuery) ||
            item.nombre.toLowerCase().contains(cleanQuery) ||
            item.tipo.toLowerCase().contains(cleanQuery) ||
            item.marca.toLowerCase().contains(cleanQuery) ||
            item.ubicacion.toLowerCase().contains(cleanQuery) ||
            item.responsable.toLowerCase().contains(cleanQuery))
        .take(5) // Limit to top 5 matches
        .toList();
  }
}
