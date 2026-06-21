import type { Request, Response } from "express";
import { prisma } from "../config/db.js";
import { getNextId } from "../utils/db.js";
import { createNotaryContract, signNotaryContract } from "../utils/notary.js";
import { generateAssetCertificate, generateAssetSummary } from "../utils/pdfGenerator.js";
import { sseManager } from "../utils/sseManager.js";
import { notificationService } from "../services/notification.service.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";

export async function getAll(_req: Request, res: Response): Promise<void> {
  const list = await prisma.activo.findMany({
    include: { tipo: true, marca: true, lugar: true },
    orderBy: { id: "asc" }
  });
  const data = list.map(item => ({
    ...item,
    fecha_registro: item.fecha_registro.toISOString().split("T")[0],
    tipo_nombre: item.tipo?.nombre ?? null,
    marca_nombre: item.marca?.nombre ?? null,
    lugar_nombre: item.lugar?.nombre ?? null
  }));
  res.json({ ok: true, data });
}

export async function getById(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const item = await prisma.activo.findUnique({
    where: { id },
    include: { tipo: true, marca: true, lugar: true }
  });
  if (!item) { res.status(404).json({ ok: false, message: "Activo no encontrado." }); return; }
  const data = {
    ...item,
    fecha_registro: item.fecha_registro.toISOString().split("T")[0],
    tipo_nombre: item.tipo?.nombre ?? null,
    marca_nombre: item.marca?.nombre ?? null,
    lugar_nombre: item.lugar?.nombre ?? null
  };
  res.json({ ok: true, data });
}

export async function create(req: Request, res: Response): Promise<void> {
  const { codigo, nombre, urlImagen, fecha_registro, estado, tipo_id, marca_id, lugar_id } = req.body;
  if (!codigo || !nombre) { res.status(400).json({ ok: false, message: "Código y nombre requeridos." }); return; }
  
  const id = await getNextId("activo");

  // Crear contrato en el servicio de Notaría Go
  const payload = { id, codigo, nombre, urlImagen, fecha_registro, tipo_id, marca_id, lugar_id };
  const contract = await createNotaryContract(`Activo: ${codigo} - ${nombre}`, payload);

  let contrato_uuid: string | null = null;
  let firma_creacion: string | null = null;

  if (contract) {
    contrato_uuid = contract.contract_id;
    // Firmar la creación inmediatamente como Administrador
    const signed = await signNotaryContract(contract.contract_id, "Administrador", contract.document_hash, "creacion");
    if (signed) {
      firma_creacion = contract.digital_signature;
    }
  }

  const created = await prisma.activo.create({
    data: {
      id,
      codigo,
      nombre,
      urlImagen: urlImagen ?? "",
      fecha_registro: fecha_registro ? new Date(fecha_registro) : new Date(),
      estado: estado ?? true,
      tipo_id: tipo_id ? Number(tipo_id) : null,
      marca_id: marca_id ? Number(marca_id) : null,
      lugar_id: lugar_id ? Number(lugar_id) : null,
      contrato_uuid,
      firma_creacion
    }
  });
  
  const data = {
    ...created,
    fecha_registro: created.fecha_registro.toISOString().split("T")[0]
  };
  sseManager.broadcast("activo_cambiado", { id: created.id, action: "create" });
  notificationService.notifyAssetCreatedOrDecommissioned(created.id, 'created');
  res.status(201).json({ ok: true, data });
}

export async function update(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const { codigo, nombre, urlImagen, fecha_registro, estado, tipo_id, marca_id, lugar_id } = req.body;

  const updateData: any = {};
  if (codigo !== undefined) updateData.codigo = codigo;
  if (nombre !== undefined) updateData.nombre = nombre;
  if (urlImagen !== undefined) updateData.urlImagen = urlImagen;
  if (fecha_registro !== undefined) updateData.fecha_registro = fecha_registro ? new Date(fecha_registro) : undefined;
  if (estado !== undefined) updateData.estado = estado;
  if (tipo_id !== undefined) updateData.tipo_id = tipo_id ? Number(tipo_id) : null;
  if (marca_id !== undefined) updateData.marca_id = marca_id ? Number(marca_id) : null;
  if (lugar_id !== undefined) updateData.lugar_id = lugar_id ? Number(lugar_id) : null;

  try {
    // Si se está dando de baja (estado false), firmar en Go Notary
    if (estado === false) {
      const actual = await prisma.activo.findUnique({ where: { id } });
      if (actual && actual.contrato_uuid && !actual.firma_baja) {
        const signed = await signNotaryContract(
          actual.contrato_uuid,
          "Baja Administrador",
          actual.firma_creacion || "activo_baja",
          "baja"
        );
        if (signed) {
          updateData.firma_baja = "Firma_Baja_Administrador_Verificada";
        }
      }
    }

    const updated = await prisma.activo.update({
      where: { id },
      data: updateData
    });
    const data = {
      ...updated,
      fecha_registro: updated.fecha_registro.toISOString().split("T")[0]
    };
    sseManager.broadcast("activo_cambiado", { id: updated.id, action: "update" });
    if (updateData.estado === false) {
      notificationService.notifyAssetCreatedOrDecommissioned(updated.id, 'decommissioned');
    }
    res.json({ ok: true, data });
  } catch {
    res.status(404).json({ ok: false, message: "Activo no encontrado o error en actualización." });
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  try {
    const actual = await prisma.activo.findUnique({ where: { id } });
    if (!actual) {
      res.status(404).json({ ok: false, message: "Activo no encontrado." });
      return;
    }

    // Firmar la baja en Go Notary
    let firmaBaja = actual.firma_baja;
    if (actual.contrato_uuid) {
      const signed = await signNotaryContract(
        actual.contrato_uuid,
        "Baja Administrador",
        actual.firma_creacion || "activo_baja",
        "baja"
      );
      if (signed) {
        firmaBaja = "Firma_Baja_Administrador_Verificada";
      }
    }

    // En lugar de eliminar, marcamos estado = false (Dar de baja)
    await prisma.activo.update({
      where: { id },
      data: {
        estado: false,
        firma_baja: firmaBaja
      }
    });

    sseManager.broadcast("activo_cambiado", { id, action: "decommission" });
    notificationService.notifyAssetCreatedOrDecommissioned(id, 'decommissioned');
    res.json({ ok: true, message: "Activo dado de baja con firma digital." });
  } catch {
    res.status(500).json({ ok: false, message: "Error al dar de baja el activo." });
  }
}

export async function getIndividualReport(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  try {
    const asset = await prisma.activo.findUnique({
      where: { id },
      include: { tipo: true, marca: true, lugar: true }
    });
    if (!asset) {
      res.status(404).json({ ok: false, message: "Activo no encontrado." });
      return;
    }

    const movements = await prisma.movimiento.findMany({
      where: { activo_id: id },
      include: { lugarOrigen: true, lugarDestino: true, estadoMovimiento: true },
      orderBy: { fecha_movimiento: "asc" }
    });

    const formattedMovements = movements.map(mov => ({
      ...mov,
      lugar_origen: mov.lugarOrigen,
      lugar_destino: mov.lugarDestino,
      estado_movimiento: mov.estadoMovimiento
    }));

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename=activo-${asset.codigo}.pdf`);

    await generateAssetCertificate(res, asset, formattedMovements);

    const authReq = req as AuthRequest;
    if (authReq.user?.sub) {
      notificationService.notifyPdfDownloaded(authReq.user.sub, "Activo Individual", asset.codigo);
    }
  } catch (error) {
    res.status(500).json({ ok: false, message: "Error al generar el PDF del activo." });
  }
}

export async function getSummaryReport(req: Request, res: Response): Promise<void> {
  const { lugar_id, estado, fecha_inicio, fecha_fin } = req.query;
  try {
    const where: any = {};
    if (lugar_id) {
      where.lugar_id = Number(lugar_id);
    }
    if (estado !== undefined && estado !== "") {
      where.estado = estado === "true" || estado === "1";
    }
    if (fecha_inicio || fecha_fin) {
      where.fecha_registro = {};
      if (fecha_inicio) where.fecha_registro.gte = new Date(fecha_inicio as string);
      if (fecha_fin) where.fecha_registro.lte = new Date(fecha_fin as string);
    }

    const list = await prisma.activo.findMany({
      where,
      include: { tipo: true, marca: true, lugar: true },
      orderBy: { id: "asc" }
    });

    let lugarName = "Todas";
    if (lugar_id) {
      const l = await prisma.lugar.findUnique({ where: { id: Number(lugar_id) } });
      if (l) lugarName = l.nombre;
    }

    const filters = {
      lugar: lugarName,
      estado: estado === "true" ? "Disponible" : estado === "false" ? "De Baja" : "Todos",
      fechaRange: (fecha_inicio || fecha_fin)
        ? `${fecha_inicio || ""} a ${fecha_fin || ""}`
        : "Histórico"
    };

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=reporte-activos.pdf");

    generateAssetSummary(res, list, filters);

    const authReq = req as AuthRequest;
    if (authReq.user?.sub) {
      notificationService.notifyPdfDownloaded(authReq.user.sub, "Reporte de Activos", `Ubicación: ${filters.lugar}, Estado: ${filters.estado}`);
    }
  } catch (error) {
    res.status(500).json({ ok: false, message: "Error al generar el reporte de activos." });
  }
}
