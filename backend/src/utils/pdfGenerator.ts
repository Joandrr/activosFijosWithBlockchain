import PDFDocument from "pdfkit";
import type { Response } from "express";

/**
 * Draws a clean header block with UAGRM / FICCT branding.
 */
function drawHeader(doc: PDFKit.PDFDocument, title: string) {
  // Primary color accent: Dark Slate / Indigo
  doc.rect(50, 45, 495, 3).fill("#1E3A8A");

  doc.fillColor("#1E293B")
     .fontSize(10)
     .font("Helvetica-Bold")
     .text("UNIVERSIDAD AUTÓNOMA GABRIEL RENÉ MORENO", 50, 55);

  doc.fontSize(8)
     .font("Helvetica")
     .text("Facultad de Ingeniería en Ciencias de la Computación y Telecomunicaciones (F.I.C.C.T.)", 50, 68);

  doc.fontSize(16)
     .font("Helvetica-Bold")
     .fillColor("#1E3A8A")
     .text(title.toUpperCase(), 50, 90, { align: "center" });

  doc.rect(50, 115, 495, 1).fill("#E2E8F0");
  doc.moveDown(2);
}

/**
 * Draws a clean footer with page numbering and metadata.
 */
function drawFooter(doc: PDFKit.PDFDocument, pageNum: number = 1) {
  doc.rect(50, 740, 495, 1).fill("#E2E8F0");
  doc.fontSize(7)
     .font("Helvetica")
     .fillColor("#64748B")
     .text(`Generado automáticamente - Sistema de Activos Fijos con Blockchain`, 50, 750);
  doc.text(`Página ${pageNum}`, 450, 750, { align: "right" });
}

/**
 * Draws a key-value grid for metadata block.
 */
function drawMetadataBlock(doc: PDFKit.PDFDocument, y: number, data: { label: string; value: string }[]) {
  let currentY = y;
  doc.font("Helvetica");

  data.forEach((item, index) => {
    // Alternate background row colors
    if (index % 2 === 0) {
      doc.rect(50, currentY - 2, 495, 16).fill("#F8FAFC");
    }

    doc.fillColor("#475569")
       .font("Helvetica-Bold")
       .fontSize(9)
       .text(item.label, 60, currentY);

    doc.fillColor("#0F172A")
       .font("Helvetica")
       .fontSize(9)
       .text(item.value, 180, currentY, { width: 350 });

    currentY += 16;
  });

  return currentY;
}

/**
 * Generates detailed PDF for a single Asset.
 */
export function generateAssetCertificate(res: Response, asset: any, movements: any[]) {
  const doc = new PDFDocument({ margin: 50, size: "A4" });
  doc.pipe(res);

  drawHeader(doc, "Ficha Técnica e Historial de Activo");

  // Basic Info Block
  doc.fillColor("#1E3A8A").font("Helvetica-Bold").fontSize(11).text("DATOS GENERALES DEL ACTIVO", 50, 135);
  doc.moveDown(0.5);

  const basicData = [
    { label: "Código de Activo:", value: asset.codigo },
    { label: "Nombre:", value: asset.nombre },
    { label: "Descripción:", value: asset.descripcion || "Sin descripción" },
    { label: "Tipo / Categoría:", value: asset.tipo?.nombre || "N/A" },
    { label: "Fabricante / Marca:", value: asset.marca?.nombre || "N/A" },
    { label: "Ubicación Actual:", value: asset.lugar?.nombre || "N/A" },
    { label: "Fecha de Registro:", value: asset.fecha_registro ? new Date(asset.fecha_registro).toISOString().split("T")[0] : "N/A" },
    { label: "Estado del Activo:", value: asset.estado ? "DISPONIBLE / ACTIVO" : "DADO DE BAJA" }
  ];

  let y = drawMetadataBlock(doc, 150, basicData);
  y += 20;

  // Blockchain Notary Info
  doc.fillColor("#1E3A8A").font("Helvetica-Bold").fontSize(11).text("CERTIFICACIÓN NOTARIAL (BLOCKCHAIN)", 50, y);
  doc.moveDown(0.5);
  y += 15;

  const cryptoData = [
    { label: "UUID Contrato Notaría:", value: asset.contrato_uuid || "NO NOTARIZADO" },
    { label: "Firma Digital Alta:", value: asset.firma_creacion ? `${asset.firma_creacion.substring(0, 70)}...` : "SIN FIRMA" },
    { label: "Firma Digital Baja:", value: asset.firma_baja || "ACTIVO DISPONIBLE" }
  ];

  y = drawMetadataBlock(doc, y, cryptoData);
  y += 25;

  // Transfer History
  doc.fillColor("#1E3A8A").font("Helvetica-Bold").fontSize(11).text("HISTORIAL DE MOVIMIENTOS Y TRASLADOS", 50, y);
  y += 15;

  // Draw table header
  doc.rect(50, y, 495, 18).fill("#1E293B");
  doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(8);
  doc.text("Código", 55, y + 5, { width: 80 });
  doc.text("Origen", 140, y + 5, { width: 90 });
  doc.text("Destino", 240, y + 5, { width: 90 });
  doc.text("Fecha", 340, y + 5, { width: 70 });
  doc.text("Emisor / Receptor", 420, y + 5, { width: 120 });

  y += 18;
  doc.font("Helvetica").fontSize(7).fillColor("#0F172A");

  if (movements.length === 0) {
    doc.rect(50, y, 495, 18).fill("#F8FAFC");
    doc.fillColor("#0F172A");
    doc.text("No existen traslados registrados para este activo.", 60, y + 5, { align: "center", width: 475 });
  } else {
    movements.forEach((mov, idx) => {
      if (idx % 2 === 0) {
        doc.rect(50, y, 495, 18).fill("#F8FAFC");
      }
      doc.fillColor("#0F172A");
      doc.text(mov.codigo_movimiento, 55, y + 5, { width: 80, ellipsis: true });
      doc.text(mov.lugar_origen?.nombre || "N/A", 140, y + 5, { width: 90, ellipsis: true });
      doc.text(mov.lugar_destino?.nombre || "N/A", 240, y + 5, { width: 90, ellipsis: true });
      doc.text((mov.fecha_movimiento ? new Date(mov.fecha_movimiento).toISOString().split("T")[0] : "N/A") || "N/A", 340, y + 5, { width: 70 });
      
      const emisor = mov.firma_emisor ? "FIRMADO" : "PENDIENTE";
      const receptor = mov.firma_receptor ? "FIRMADO" : "PENDIENTE";
      doc.text(`E: ${emisor} / R: ${receptor}`, 420, y + 5, { width: 120 });
      
      y += 18;
    });
  }

  drawFooter(doc, 1);
  doc.end();
}

/**
 * Generates tabular PDF summary for multiple Assets.
 */
export function generateAssetSummary(res: Response, assets: any[], filters: any) {
  const doc = new PDFDocument({ margin: 50, size: "A4" });
  doc.pipe(res);

  drawHeader(doc, "Reporte Consolidado de Activos");

  // Print Active Filters
  doc.fillColor("#475569").font("Helvetica-Bold").fontSize(9).text("Filtros aplicados:", 50, 130);
  doc.font("Helvetica").fontSize(8);
  doc.text(`Ubicación: ${filters.lugar || "Todas"}  |  Estado: ${filters.estado || "Todos"}  |  Fecha: ${filters.fechaRange || "Histórico"}`, 50, 142);

  let y = 165;

  // Table Headers
  doc.rect(50, y, 495, 20).fill("#1E3A8A");
  doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(8);
  doc.text("Código", 55, y + 6, { width: 80 });
  doc.text("Nombre", 140, y + 6, { width: 130 });
  doc.text("Ubicación", 280, y + 6, { width: 100 });
  doc.text("Categoría / Tipo", 390, y + 6, { width: 90 });
  doc.text("Estado", 490, y + 6, { width: 50 });

  y += 20;
  doc.font("Helvetica").fontSize(8).fillColor("#0F172A");

  assets.forEach((asset, idx) => {
    // Add new page if content overflows
    if (y > 700) {
      drawFooter(doc, 1); // simple pagination
      doc.addPage();
      drawHeader(doc, "Reporte Consolidado de Activos");
      y = 130;
      doc.rect(50, y, 495, 20).fill("#1E3A8A");
      doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(8);
      doc.text("Código", 55, y + 6, { width: 80 });
      doc.text("Nombre", 140, y + 6, { width: 130 });
      doc.text("Ubicación", 280, y + 6, { width: 100 });
      doc.text("Categoría / Tipo", 390, y + 6, { width: 90 });
      doc.text("Estado", 490, y + 6, { width: 50 });
      y += 20;
      doc.font("Helvetica").fontSize(8).fillColor("#0F172A");
    }

    if (idx % 2 === 0) {
      doc.rect(50, y, 495, 18).fill("#F8FAFC");
    }

    doc.fillColor("#0F172A");
    doc.text(asset.codigo, 55, y + 5, { width: 80, ellipsis: true });
    doc.text(asset.nombre, 140, y + 5, { width: 130, ellipsis: true });
    doc.text(asset.lugar?.nombre || "N/A", 280, y + 5, { width: 100, ellipsis: true });
    doc.text(asset.tipo?.nombre || "N/A", 390, y + 5, { width: 90, ellipsis: true });
    doc.text(asset.estado ? "ACTIVO" : "BAJA", 490, y + 5, { width: 50 });

    y += 18;
  });

  drawFooter(doc, 1);
  doc.end();
}

/**
 * Generates detailed PDF contract for a single Movement.
 */
export function generateMovementCertificate(res: Response, movement: any) {
  const doc = new PDFDocument({ margin: 50, size: "A4" });
  doc.pipe(res);

  drawHeader(doc, "Certificado de Transferencia de Activo");

  // General Transfer Info
  doc.fillColor("#1E3A8A").font("Helvetica-Bold").fontSize(11).text("DETALLES DEL TRASLADO", 50, 135);
  doc.moveDown(0.5);

  const transferData = [
    { label: "Código de Traslado:", value: movement.codigo_movimiento },
    { label: "Fecha del Traslado:", value: movement.fecha_movimiento ? new Date(movement.fecha_movimiento).toISOString().split("T")[0] : "N/A" },
    { label: "Activo Involucrado:", value: `${movement.activo?.codigo || "N/A"} - ${movement.activo?.nombre || "N/A"}` },
    { label: "Ubicación de Origen:", value: movement.lugar_origen?.nombre || "N/A" },
    { label: "Ubicación de Destino:", value: movement.lugar_destino?.nombre || "N/A" },
    { label: "Estado del Proceso:", value: movement.estado_movimiento?.nombre || "N/A" }
  ];

  let y = drawMetadataBlock(doc, 150, transferData);
  y += 20;

  // Blockchain Notary Info
  doc.fillColor("#1E3A8A").font("Helvetica-Bold").fontSize(11).text("SELLOS NOTARIALES EN LEDGER INMUTABLE", 50, y);
  doc.moveDown(0.5);
  y += 15;

  const cryptoData = [
    { label: "UUID Contrato Notaría:", value: movement.contrato_uuid || "NO NOTARIZADO" },
    { label: "Firma Digital Emisor:", value: movement.firma_emisor || "PENDIENTE DE FIRMA" },
    { label: "Firma Digital Receptor:", value: movement.firma_receptor || "PENDIENTE DE FIRMA" }
  ];

  y = drawMetadataBlock(doc, y, cryptoData);
  y += 35;

  // Signatures display boxes
  doc.fillColor("#1E3A8A").font("Helvetica-Bold").fontSize(11).text("RESPONSABLES DE LA OPERACIÓN", 50, y);
  y += 15;

  // Emisor Card
  doc.rect(50, y, 235, 90).fill("#F8FAFC");
  doc.rect(50, y, 235, 90).stroke("#CBD5E1");
  doc.fillColor("#1E293B").font("Helvetica-Bold").fontSize(9).text("AUXILIAR / EMISOR", 60, y + 10);
  doc.font("Helvetica").fontSize(8).fillColor("#475569");
  doc.text(`Nombre: ${movement.usuario?.nombre || "N/A"} ${movement.usuario?.apellido || ""}`, 60, y + 26);
  doc.text(`Firma digital:`, 60, y + 42);
  doc.font("Courier").fontSize(6).text(movement.firma_emisor ? `${movement.firma_emisor.substring(0, 50)}...` : "PENDIENTE DE FIRMAR", 60, y + 52, { width: 215 });

  // Receptor Card
  doc.rect(310, y, 235, 90).fill("#F8FAFC");
  doc.rect(310, y, 235, 90).stroke("#CBD5E1");
  doc.fillColor("#1E293B").font("Helvetica-Bold").fontSize(9).text("AUXILIAR / RECEPTOR", 320, y + 10);
  doc.font("Helvetica").fontSize(8).fillColor("#475569");
  // Find who receptor is: either get user relation or show pending
  doc.text(`Estado de Firma:`, 320, y + 26);
  doc.text(movement.firma_receptor ? "FIRMADO Y CONFIRMADO" : "PENDIENTE DE CONFIRMACIÓN", 320, y + 38, { width: 215 });
  doc.text(`Firma digital:`, 320, y + 54);
  doc.font("Courier").fontSize(6).text(movement.firma_receptor ? `${movement.firma_receptor.substring(0, 50)}...` : "PENDIENTE", 320, y + 64, { width: 215 });

  drawFooter(doc, 1);
  doc.end();
}

/**
 * Generates tabular PDF summary for multiple Movements.
 */
export function generateMovementSummary(res: Response, movements: any[], filters: any) {
  const doc = new PDFDocument({ margin: 50, size: "A4" });
  doc.pipe(res);

  drawHeader(doc, "Reporte de Traslados de Activos");

  // Print Active Filters
  doc.fillColor("#475569").font("Helvetica-Bold").fontSize(9).text("Filtros aplicados:", 50, 130);
  doc.font("Helvetica").fontSize(8);
  doc.text(`Rango de Fechas: ${filters.fechaRange || "Todos"}  |  Estado: ${filters.estado || "Todos"}`, 50, 142);

  let y = 165;

  // Table Headers
  doc.rect(50, y, 495, 20).fill("#1E3A8A");
  doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(8);
  doc.text("Código", 55, y + 6, { width: 90 });
  doc.text("Activo", 150, y + 6, { width: 110 });
  doc.text("Origen", 270, y + 6, { width: 90 });
  doc.text("Destino", 370, y + 6, { width: 90 });
  doc.text("Fecha", 470, y + 6, { width: 70 });

  y += 20;
  doc.font("Helvetica").fontSize(8).fillColor("#0F172A");

  movements.forEach((mov, idx) => {
    // Add new page if content overflows
    if (y > 700) {
      drawFooter(doc, 1);
      doc.addPage();
      drawHeader(doc, "Reporte de Traslados de Activos");
      y = 130;
      doc.rect(50, y, 495, 20).fill("#1E3A8A");
      doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(8);
      doc.text("Código", 55, y + 6, { width: 90 });
      doc.text("Activo", 150, y + 6, { width: 110 });
      doc.text("Origen", 270, y + 6, { width: 90 });
      doc.text("Destino", 370, y + 6, { width: 90 });
      doc.text("Fecha", 470, y + 6, { width: 70 });
      y += 20;
      doc.font("Helvetica").fontSize(8).fillColor("#0F172A");
    }

    if (idx % 2 === 0) {
      doc.rect(50, y, 495, 18).fill("#F8FAFC");
    }

    doc.fillColor("#0F172A");
    doc.text(mov.codigo_movimiento, 55, y + 5, { width: 90, ellipsis: true });
    doc.text(mov.activo?.nombre || "N/A", 150, y + 5, { width: 110, ellipsis: true });
    doc.text(mov.lugar_origen?.nombre || "N/A", 270, y + 5, { width: 90, ellipsis: true });
    doc.text(mov.lugar_destino?.nombre || "N/A", 370, y + 5, { width: 90, ellipsis: true });
    doc.text((mov.fecha_movimiento ? new Date(mov.fecha_movimiento).toISOString().split("T")[0] : "N/A") || "N/A", 470, y + 5, { width: 70 });

    y += 18;
  });

  drawFooter(doc, 1);
  doc.end();
}
