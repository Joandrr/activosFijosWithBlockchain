import type { Request, Response } from "express";
import { prisma } from "../config/db.js";
import { getNextId } from "../utils/db.js";
import { createNotaryContract, signNotaryContract, getNotaryContract } from "../utils/notary.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import { generateMovementCertificate, generateMovementSummary } from "../utils/pdfGenerator.js";
import { sseManager } from "../utils/sseManager.js";
import { notificationService } from "../services/notification.service.js";

export async function getAll(_req: Request, res: Response): Promise<void> {
  const req = _req as AuthRequest;
  const user = req.user;

  let whereClause = {};

  if (user && user.rol_id !== 1) {
    // Buscar los laboratorios/lugares bajo su responsabilidad
    const responsibilities = await prisma.responsableLugar.findMany({
      where: { usuario_id: user.sub },
      select: { lugar_id: true }
    });
    const placeIds = responsibilities.map(r => r.lugar_id).filter((id): id is number => id !== null);

    whereClause = {
      OR: [
        { usuario_id: user.sub },
        { lugar_origen_id: { in: placeIds } },
        { lugar_destino_id: { in: placeIds } }
      ]
    };
  }

  const list = await prisma.movimiento.findMany({
    where: whereClause,
    include: {
      estadoMovimiento: true,
      estadoActivo: true,
      lugarOrigen: true,
      lugarDestino: true,
      usuario: true,
      activo: true
    },
    orderBy: { id: "asc" }
  });
  const data = list.map(item => ({
    ...item,
    fecha_movimiento: item.fecha_movimiento.toISOString().split("T")[0],
    estado_movimiento_nombre: item.estadoMovimiento?.nombre ?? null,
    estado_activo_nombre: item.estadoActivo?.nombre ?? null,
    lugar_origen_nombre: item.lugarOrigen?.nombre ?? null,
    lugar_destino_nombre: item.lugarDestino?.nombre ?? null,
    usuario_nombre: item.usuario?.nombre ?? null,
    activo_nombre: item.activo?.nombre ?? null
  }));
  res.json({ ok: true, data });
}

export async function getById(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const item = await prisma.movimiento.findUnique({
    where: { id },
    include: {
      estadoMovimiento: true,
      estadoActivo: true,
      lugarOrigen: true,
      lugarDestino: true,
      usuario: true,
      activo: true
    }
  });
  if (!item) { res.status(404).json({ ok: false, message: "Movimiento no encontrado." }); return; }
  const data = {
    ...item,
    fecha_movimiento: item.fecha_movimiento.toISOString().split("T")[0],
    estado_movimiento_nombre: item.estadoMovimiento?.nombre ?? null,
    estado_activo_nombre: item.estadoActivo?.nombre ?? null,
    lugar_origen_nombre: item.lugarOrigen?.nombre ?? null,
    lugar_destino_nombre: item.lugarDestino?.nombre ?? null,
    usuario_nombre: item.usuario?.nombre ?? null,
    activo_nombre: item.activo?.nombre ?? null
  };
  res.json({ ok: true, data });
}

export async function create(req: Request, res: Response): Promise<void> {
  const { codigo_movimiento, fecha_movimiento, observaciones, estado_activo_id, lugar_origen_id, lugar_destino_id, usuario_id, activo_id } = req.body;
  if (!codigo_movimiento) { res.status(400).json({ ok: false, message: "Código de movimiento requerido." }); return; }
  
  const id = await getNextId("movimiento");

  // Crear contrato en el servicio de Notaría Go
  const payload = { id, codigo_movimiento, fecha_movimiento, lugar_origen_id, lugar_destino_id, activo_id, usuario_id };
  const contract = await createNotaryContract(`Movimiento: ${codigo_movimiento}`, payload);

  let contrato_uuid: string | null = null;
  let firma_emisor: string | null = null;

  if (contract) {
    contrato_uuid = contract.contract_id;
  }

  const created = await prisma.movimiento.create({
    data: {
      id,
      codigo_movimiento,
      fecha_movimiento: fecha_movimiento ? new Date(fecha_movimiento) : new Date(),
      observaciones: observaciones ?? "",
      estado_movimiento_id: 1, // Pendiente (espera firma de receptor)
      estado_activo_id: estado_activo_id ? Number(estado_activo_id) : null,
      lugar_origen_id: lugar_origen_id ? Number(lugar_origen_id) : null,
      lugar_destino_id: lugar_destino_id ? Number(lugar_destino_id) : null,
      usuario_id: usuario_id ? Number(usuario_id) : null,
      activo_id: activo_id ? Number(activo_id) : null,
      contrato_uuid,
      firma_emisor
    }
  });
  
  const data = {
    ...created,
    fecha_movimiento: created.fecha_movimiento.toISOString().split("T")[0]
  };
  sseManager.broadcast("movimiento_cambiado", { id: created.id, action: "create" });
  notificationService.notifyMovementCreated(created.id);
  res.status(201).json({ ok: true, data });
}

export async function update(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const { codigo_movimiento, fecha_movimiento, observaciones, estado_movimiento_id, estado_activo_id, lugar_origen_id, lugar_destino_id, usuario_id } = req.body;

  const updateData: any = {};
  if (codigo_movimiento !== undefined) updateData.codigo_movimiento = codigo_movimiento;
  if (fecha_movimiento !== undefined) updateData.fecha_movimiento = fecha_movimiento ? new Date(fecha_movimiento) : undefined;
  if (observaciones !== undefined) updateData.observaciones = observaciones;
  if (estado_movimiento_id !== undefined) updateData.estado_movimiento_id = estado_movimiento_id ? Number(estado_movimiento_id) : null;
  if (estado_activo_id !== undefined) updateData.estado_activo_id = estado_activo_id ? Number(estado_activo_id) : null;
  if (lugar_origen_id !== undefined) updateData.lugar_origen_id = lugar_origen_id ? Number(lugar_origen_id) : null;
  if (lugar_destino_id !== undefined) updateData.lugar_destino_id = lugar_destino_id ? Number(lugar_destino_id) : null;
  if (usuario_id !== undefined) updateData.usuario_id = usuario_id ? Number(usuario_id) : null;

  try {
    const updated = await prisma.movimiento.update({
      where: { id },
      data: updateData
    });
    const data = {
      ...updated,
      fecha_movimiento: updated.fecha_movimiento.toISOString().split("T")[0]
    };
    sseManager.broadcast("movimiento_cambiado", { id: updated.id, action: "update" });
    res.json({ ok: true, data });
  } catch {
    res.status(404).json({ ok: false, message: "Movimiento no encontrado." });
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  try {
    await prisma.movimiento.delete({ where: { id } });
    res.json({ ok: true, message: "Movimiento eliminado." });
  } catch {
    res.status(404).json({ ok: false, message: "Movimiento no encontrado." });
  }
}

export async function signReceptor(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  try {
    const movimiento = await prisma.movimiento.findUnique({
      where: { id },
      include: { activo: true }
    });

    if (!movimiento) {
      res.status(404).json({ ok: false, message: "Movimiento no encontrado." });
      return;
    }

    if (movimiento.estado_movimiento_id === 2) {
      res.status(400).json({ ok: false, message: "El movimiento ya fue completamente firmado (Ejecutado)." });
      return;
    }

    if (!movimiento.firma_emisor) {
      res.status(400).json({ ok: false, message: "El emisor debe firmar primero antes de que el receptor pueda firmar." });
      return;
    }

    let firmaReceptor = movimiento.firma_receptor;

    // Registrar firma en el servicio Go Notary
    if (movimiento.contrato_uuid) {
      const contract = await getNotaryContract(movimiento.contrato_uuid);
      const docHash = contract?.document_hash || "movimiento_document_hash";
      const signed = await signNotaryContract(
        movimiento.contrato_uuid,
        "Auxiliar Receptor",
        docHash,
        "recepcion"
      );
      if (signed) {
        firmaReceptor = "Firma_Receptor_Auxiliar_Verificada";
      }
    } else {
      firmaReceptor = "Firma_Receptor_Sin_Contrato";
    }

    // Actualizar el estado del movimiento en PostgreSQL a "Ejecutado" (ID 2) solo si ambas firmas están completas
    const updated = await prisma.movimiento.update({
      where: { id },
      data: {
        estado_movimiento_id: 2, // Ejecutado — ambas firmas completadas
        firma_receptor: firmaReceptor
      }
    });

    // Mover físicamente el activo al nuevo lugar de destino
    if (movimiento.activo_id && movimiento.lugar_destino_id) {
      await prisma.activo.update({
        where: { id: movimiento.activo_id },
        data: {
          lugar_id: movimiento.lugar_destino_id
        }
      });
    }

    res.json({
      ok: true,
      message: "✅ Firma del receptor registrada. Movimiento completado. Ubicación del activo actualizada.",
      data: {
        ...updated,
        fecha_movimiento: updated.fecha_movimiento.toISOString().split("T")[0]
      }
    });
    sseManager.broadcast("movimiento_cambiado", { id: updated.id, action: "sign_receptor" });
    sseManager.broadcast("activo_cambiado", { id: movimiento.activo_id, action: "update" });
    notificationService.notifyMovementSigned(updated.id, 'receptor');
  } catch (error) {
    console.error("❌ Error en signReceptor:", error);
    res.status(500).json({ ok: false, message: "Error al registrar la firma del receptor." });
  }
}

export async function signEmisor(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  try {
    const movimiento = await prisma.movimiento.findUnique({
      where: { id },
      include: { activo: true }
    });

    if (!movimiento) {
      res.status(404).json({ ok: false, message: "Movimiento no encontrado." });
      return;
    }

    if (movimiento.firma_emisor) {
      res.status(400).json({ ok: false, message: "El emisor ya ha firmado este movimiento." });
      return;
    }

    let firma_emisor: string | null = null;
    let contrato_uuid = movimiento.contrato_uuid;

    // Si no hay contrato aún, créalo primero
    if (!contrato_uuid) {
      const payload = {
        id: movimiento.id,
        codigo_movimiento: movimiento.codigo_movimiento,
        fecha_movimiento: movimiento.fecha_movimiento,
        lugar_origen_id: movimiento.lugar_origen_id,
        lugar_destino_id: movimiento.lugar_destino_id,
        activo_id: movimiento.activo_id,
        usuario_id: movimiento.usuario_id
      };
      const contract = await createNotaryContract(`Movimiento: ${movimiento.codigo_movimiento}`, payload);
      if (contract) {
        contrato_uuid = contract.contract_id;
        const signed = await signNotaryContract(contract.contract_id, "Auxiliar Emisor", contract.document_hash, "emision");
        if (signed) {
          firma_emisor = "Firma_Emisor_Auxiliar_Verificada";
        }
      }
    } else {
      // Firmar sobre contrato existente
      const contract = await getNotaryContract(contrato_uuid);
      const docHash = contract?.document_hash || "hash_emision";
      const signed = await signNotaryContract(contrato_uuid, "Auxiliar Emisor", docHash, "emision");
      if (signed) {
        firma_emisor = "Firma_Emisor_Auxiliar_Verificada";
      }
    }

    if (!firma_emisor) {
      firma_emisor = "Firma_Emisor_Sin_Notaria";
    }

    const updated = await prisma.movimiento.update({
      where: { id },
      data: {
        firma_emisor,
        contrato_uuid: contrato_uuid ?? null,
        estado_movimiento_id: 1 // Sigue En Proceso — falta firma del receptor
      }
    });

    res.json({
      ok: true,
      message: "✅ Firma del emisor registrada. Pendiente firma del receptor.",
      data: {
        ...updated,
        fecha_movimiento: updated.fecha_movimiento.toISOString().split("T")[0]
      }
    });
    sseManager.broadcast("movimiento_cambiado", { id: updated.id, action: "sign_emisor" });
    notificationService.notifyMovementSigned(updated.id, 'emisor');
  } catch (error) {
    console.error("❌ Error en signEmisor:", error);
    res.status(500).json({ ok: false, message: "Error al registrar la firma del emisor." });
  }
}

export async function getIndividualReport(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  try {
    const movement = await prisma.movimiento.findUnique({
      where: { id },
      include: {
        activo: true,
        lugarOrigen: true,
        lugarDestino: true,
        estadoMovimiento: true,
        usuario: true
      }
    });

    if (!movement) {
      res.status(404).json({ ok: false, message: "Movimiento no encontrado." });
      return;
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename=contrato-traslado-${movement.codigo_movimiento}.pdf`);

    const formattedMovement = {
      ...movement,
      lugar_origen: movement.lugarOrigen,
      lugar_destino: movement.lugarDestino,
      estado_movimiento: movement.estadoMovimiento
    };

    await generateMovementCertificate(res, formattedMovement);

    const authReq = req as AuthRequest;
    if (authReq.user?.sub) {
      notificationService.notifyPdfDownloaded(authReq.user.sub, "Contrato de Traslado", movement.codigo_movimiento);
    }
  } catch (error) {
    res.status(500).json({ ok: false, message: "Error al generar el reporte del movimiento." });
  }
}

export async function getSummaryReport(req: Request, res: Response): Promise<void> {
  const { fecha_inicio, fecha_fin, estado_id } = req.query;
  try {
    const where: any = {};
    if (estado_id) {
      where.estado_movimiento_id = Number(estado_id);
    }
    if (fecha_inicio || fecha_fin) {
      where.fecha_movimiento = {};
      if (fecha_inicio) where.fecha_movimiento.gte = new Date(fecha_inicio as string);
      if (fecha_fin) where.fecha_movimiento.lte = new Date(fecha_fin as string);
    }

    const list = await prisma.movimiento.findMany({
      where,
      include: {
        activo: true,
        lugarOrigen: true,
        lugarDestino: true,
        estadoMovimiento: true,
        usuario: true
      },
      orderBy: { id: "asc" }
    });

    const formattedList = list.map(item => ({
      ...item,
      lugar_origen: item.lugarOrigen,
      lugar_destino: item.lugarDestino,
      estado_movimiento: item.estadoMovimiento
    }));

    let estadoLabel = "Todos";
    if (estado_id) {
      const est = await prisma.estadoMovimiento.findUnique({ where: { id: Number(estado_id) } });
      if (est) estadoLabel = est.nombre;
    }

    const filters = {
      estado: estadoLabel,
      fechaRange: (fecha_inicio || fecha_fin)
        ? `${fecha_inicio || ""} a ${fecha_fin || ""}`
        : "Todos"
    };

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=reporte-traslados.pdf");

    generateMovementSummary(res, formattedList, filters);

    const authReq = req as AuthRequest;
    if (authReq.user?.sub) {
      notificationService.notifyPdfDownloaded(authReq.user.sub, "Reporte de Traslados", `Estado: ${filters.estado}, Rango: ${filters.fechaRange}`);
    }
  } catch (error) {
    res.status(500).json({ ok: false, message: "Error al generar el reporte general de movimientos." });
  }
}
