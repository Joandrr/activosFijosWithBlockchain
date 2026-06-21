export interface DatasetAsset {
  id: number;
  codigo: string;
  nombre: string;
  tipo: string;
  marca: string;
  ubicacion: string;
  responsable: string;
  estado: string;
  sello_digital: string;
}

const TIPOS = ["Computación", "Mobiliario", "Redes", "Climatización", "Audiovisual"];
const MARCAS: Record<string, string[]> = {
  Computación: ["Dell", "HP", "Lenovo", "LG", "Samsung", "Apple"],
  Mobiliario: ["Hermon", "Muebles FICCT", "MetalMadera", "Díaz Muebles"],
  Redes: ["Cisco", "MikroTik", "Huawei", "Ubiquiti", "TP-Link"],
  Climatización: ["Carrier", "Samsung", "LG", "TCL", "Panasonic"],
  Audiovisual: ["Epson", "JBL", "Sony", "BenQ", "Logitech"],
};

const NOMBRES: Record<string, string[]> = {
  Computación: ["Laptop ThinkPad T14", "Computadora EliteDesk", "Monitor UltraSharp 24\"", "Teclado Mecánico Pro", "Mouse Ergonómico", "Impresora Láser LaserJet"],
  Mobiliario: ["Silla de Oficina Ergonómica", "Escritorio Modular en L", "Mesa para Reuniones 10p", "Estante Metálico 5 Divisiones", "Pizarra Acrílica Blanca"],
  Redes: ["Router Switch Catalítico", "Switch Administrable 24 Puertos", "Access Point UniFi PRO", "Servidor de Rack PowerEdge", "Modem Fibra Óptica"],
  Climatización: ["Aire Acondicionado Split 24000 BTU", "Ventilador de Techo Industrial", "Extractor de Aire Turbina"],
  Audiovisual: ["Proyector Multimedia HD", "Sistema de Sonido Parlante Activo", "Pizarra Interactiva Táctil", "Cámara Web Videoconferencia 4K"],
};

const UBICACIONES = [
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

const RESPONSABLES = [
  "Ing. Juan Carlos Pérez",
  "Ing. María René Delgado",
  "Dr. Carlos Vargas",
  "MSc. Ana Patricia Rocha",
  "Lic. Jorge Mercado",
  "Ing. Silvia Aramayo",
  "Ing. Ricardo Aguilera",
  "Dra. Elizabeth Choque",
];

const ESTADOS = ["Excelente", "Bueno", "Regular", "Requiere Mantenimiento"];

// Deterministic generator of 10,000 items
let cachedDataset: DatasetAsset[] = [];

export function getDataset(): DatasetAsset[] {
  if (cachedDataset.length > 0) return cachedDataset;

  const dataset: DatasetAsset[] = [];
  for (let i = 1; i <= 10000; i++) {
    // Determistic select based on loop index i
    const tipo = TIPOS[i % TIPOS.length];
    const marcasDisponibles = MARCAS[tipo];
    const marca = marcasDisponibles[i % marcasDisponibles.length];
    const nombresDisponibles = NOMBRES[tipo];
    const nombreBase = nombresDisponibles[i % nombresDisponibles.length];
    const nombre = `${nombreBase} ${marca} (Mod-${100 + (i % 900)})`;

    const ubicacion = UBICACIONES[i % UBICACIONES.length];
    const responsable = RESPONSABLES[i % RESPONSABLES.length];
    const estado = i % 150 === 0 ? "De Baja" : ESTADOS[i % ESTADOS.length];

    // Padding numbers
    const padNum = String(i).padStart(5, "0");
    const codPrefix = tipo.substring(0, 3).toUpperCase();
    const codigo = `ACT-${codPrefix}-${padNum}`;

    // Dummy deterministic UUID
    const hex = (i * 123456789).toString(16).padEnd(12, "f").substring(0, 12);
    const sello_digital = `3d2b7c4d-ca5e-49b8-a6d1-${hex}`;

    dataset.push({
      id: i,
      codigo,
      nombre,
      tipo,
      marca,
      ubicacion,
      responsable,
      estado,
      sello_digital,
    });
  }

  cachedDataset = dataset;
  return dataset;
}

export function searchDataset(query: string): DatasetAsset[] {
  const dataset = getDataset();
  const cleanQuery = query.toLowerCase().trim();
  if (!cleanQuery) return [];

  return dataset
    .filter(
      (item) =>
        item.codigo.toLowerCase().includes(cleanQuery) ||
        item.nombre.toLowerCase().includes(cleanQuery) ||
        item.tipo.toLowerCase().includes(cleanQuery) ||
        item.marca.toLowerCase().includes(cleanQuery) ||
        item.ubicacion.toLowerCase().includes(cleanQuery) ||
        item.responsable.toLowerCase().includes(cleanQuery)
    )
    .slice(0, 5); // Return top 5 matches
}
