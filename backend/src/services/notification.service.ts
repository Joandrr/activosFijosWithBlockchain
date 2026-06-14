import axios from 'axios';
import { oneSignalConfig } from '../config/onesignal.js';
import { prisma } from '../config/db.js';

export class NotificationService {

  async sendToAll(title: string, message: string) {
    if (!oneSignalConfig.appId || !oneSignalConfig.apiKey) {
      console.log(`[Notification Service] OneSignal keys not configured. Skipping push notification (broadcast): "${title} - ${message}"`);
      return;
    }

    try {
      const response = await axios.post(
        'https://api.onesignal.com/notifications',
        {
          app_id: oneSignalConfig.appId,
          included_segments: ['All'],
          headings: {
            es: title,
            en: title,
          },
          contents: {
            es: message,
            en: message,
          },
        },
        {
          headers: {
            Authorization: `Key ${oneSignalConfig.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );
      console.log("[Notification Service] Sent broadcast successfully:", response.data);
      return response.data;
    } catch (error: any) {
      console.log('ONESIGNAL ERROR:', error.response?.data || error.message);
    }
  }

  async sendToUsers(userIds: string[], title: string, message: string) {
    if (userIds.length === 0) return;
    if (!oneSignalConfig.appId || !oneSignalConfig.apiKey) {
      console.log(`[Notification Service] OneSignal keys not configured. Skipping push notification: "${title} - ${message}" to users:`, userIds);
      return;
    }

    try {
      const response = await axios.post(
        'https://api.onesignal.com/notifications',
        {
          app_id: oneSignalConfig.appId,
          include_external_user_ids: userIds,
          headings: {
            es: title,
            en: title,
          },
          contents: {
            es: message,
            en: message,
          },
        },
        {
          headers: {
            Authorization: `Key ${oneSignalConfig.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );
      console.log("[Notification Service] Sent notification successfully to users:", userIds, response.data);
      return response.data;
    } catch (error: any) {
      console.log('ONESIGNAL ERROR:', error.response?.data || error.message);
    }
  }

  // Helpers de negocio específicos para notificaciones

  async notifyAssetCreatedOrDecommissioned(activoId: number, action: 'created' | 'decommissioned') {
    try {
      const asset = await prisma.activo.findUnique({
        where: { id: activoId },
        include: { lugar: true }
      });
      if (!asset) return;

      // Obtener todos los administradores (rol_id === 1)
      const admins = await prisma.usuario.findMany({
        where: { rol_id: 1, estado: true },
        select: { id: true }
      });
      const adminIds = admins.map(u => String(u.id));

      let title = "";
      let message = "";

      if (action === 'created') {
        title = "Nuevo Activo Registrado";
        message = `Se ha creado el activo ${asset.codigo} - ${asset.nombre} en ${asset.lugar?.nombre ?? 'Ubicación no especificada'}.`;
      } else {
        title = "Activo Dado de Baja";
        message = `Se ha dado de baja el activo ${asset.codigo} - ${asset.nombre} con firma digital del administrador.`;
      }

      console.log(`[Notification Service] notifyAssetCreatedOrDecommissioned: Sending to ${adminIds.length} admins.`);
      if (adminIds.length > 0) {
        await this.sendToUsers(adminIds, title, message);
      }
    } catch (err: any) {
      console.error("Error sending asset notification:", err.message || err);
    }
  }

  async notifyMovementCreated(movimientoId: number) {
    try {
      const movement = await prisma.movimiento.findUnique({
        where: { id: movimientoId },
        include: {
          activo: true,
          lugarOrigen: true,
          lugarDestino: true,
          usuario: true
        }
      });
      if (!movement) return;

      const actCode = movement.activo?.codigo ?? '';
      const actName = movement.activo?.nombre ?? '';
      const origName = movement.lugarOrigen?.nombre ?? 'Ubicación origen';
      const destName = movement.lugarDestino?.nombre ?? 'Ubicación destino';
      const details = `el traslado ${movement.codigo_movimiento} para el activo ${actCode} - ${actName} desde ${origName} hacia ${destName}`;

      // 1. Notificar a administradores (rol_id === 1)
      const admins = await prisma.usuario.findMany({
        where: { rol_id: 1, estado: true },
        select: { id: true }
      });
      const adminIds = admins.map(u => String(u.id));
      const adminMsg = `Nuevo movimiento creado: Se registró ${details} por el usuario ${movement.usuario?.nombre ?? ''} ${movement.usuario?.apellido ?? ''}.`;
      
      if (adminIds.length > 0) {
        await this.sendToUsers(adminIds, "Nuevo Movimiento de Traslado", adminMsg);
      }

      // 2. Notificar a auxiliares (rol_id !== 1) asociados al traslado o lugares de responsabilidad
      const placeIds = [movement.lugar_origen_id, movement.lugar_destino_id].filter(Boolean) as number[];
      const responsibles = await prisma.responsableLugar.findMany({
        where: { lugar_id: { in: placeIds } },
        include: { usuario: true }
      });

      const auxiliaryIdsSet = new Set<string>();
      if (movement.usuario_id) {
        const creator = await prisma.usuario.findUnique({ where: { id: movement.usuario_id } });
        if (creator && creator.rol_id !== 1 && creator.estado) {
          auxiliaryIdsSet.add(String(creator.id));
        }
      }

      for (const r of responsibles) {
        if (r.usuario && r.usuario.rol_id !== 1 && r.usuario.estado) {
          auxiliaryIdsSet.add(String(r.usuario.id));
        }
      }

      const auxiliaryIds = Array.from(auxiliaryIdsSet);
      const auxMsg = `Se ha registrado un nuevo contrato de traslado ${movement.codigo_movimiento} a tu nombre/responsabilidad. Origen: ${origName}, Destino: ${destName}.`;

      if (auxiliaryIds.length > 0) {
        await this.sendToUsers(auxiliaryIds, "Nuevo Contrato de Traslado", auxMsg);
      }
    } catch (err: any) {
      console.error("Error sending movement created notification:", err.message || err);
    }
  }

  async notifyMovementSigned(movimientoId: number, signedBy: 'emisor' | 'receptor') {
    try {
      const movement = await prisma.movimiento.findUnique({
        where: { id: movimientoId },
        include: {
          activo: true,
          lugarOrigen: true,
          lugarDestino: true,
          usuario: true
        }
      });
      if (!movement) return;

      // 1. Notificar a administradores (rol_id === 1)
      const admins = await prisma.usuario.findMany({
        where: { rol_id: 1, estado: true },
        select: { id: true }
      });
      const adminIds = admins.map(u => String(u.id));
      let adminMsg = "";
      if (signedBy === 'emisor') {
        adminMsg = `El emisor firmó el traslado ${movement.codigo_movimiento}. Estado: Pendiente de receptor.`;
      } else {
        adminMsg = `El receptor firmó el traslado ${movement.codigo_movimiento}. Estado: Ejecutado (Completado).`;
      }

      if (adminIds.length > 0) {
        await this.sendToUsers(adminIds, "Firma de Traslado Registrada", adminMsg);
      }

      // 2. Notificar a auxiliares (rol_id !== 1) según rol de firma
      const placeIds = [movement.lugar_origen_id, movement.lugar_destino_id].filter(Boolean) as number[];
      const responsibles = await prisma.responsableLugar.findMany({
        where: { lugar_id: { in: placeIds } },
        include: { usuario: true }
      });

      const emisorIds = new Set<string>();
      const receptorIds = new Set<string>();

      if (movement.usuario_id) {
        const creator = await prisma.usuario.findUnique({ where: { id: movement.usuario_id } });
        if (creator && creator.rol_id !== 1 && creator.estado) {
          emisorIds.add(String(creator.id));
        }
      }

      for (const r of responsibles) {
        if (!r.usuario || r.usuario.rol_id === 1 || !r.usuario.estado) continue;
        if (r.lugar_id === movement.lugar_origen_id) {
          emisorIds.add(String(r.usuario.id));
        }
        if (r.lugar_id === movement.lugar_destino_id) {
          receptorIds.add(String(r.usuario.id));
        }
      }

      const listEmisores = Array.from(emisorIds);
      const listReceptores = Array.from(receptorIds);

      if (signedBy === 'emisor') {
        // Notificar a emisores
        if (listEmisores.length > 0) {
          await this.sendToUsers(
            listEmisores,
            "Firma del Emisor Confirmada",
            `Has firmado exitosamente el contrato de traslado ${movement.codigo_movimiento} como emisor.`
          );
        }
        // Notificar a receptores
        if (listReceptores.length > 0) {
          await this.sendToUsers(
            listReceptores,
            "Contrato Pendiente de Firma",
            `El emisor ha firmado el contrato de traslado ${movement.codigo_movimiento}. Tu firma como receptor está pendiente.`
          );
        }
      } else {
        // Receptor firmó
        // Notificar a receptores
        if (listReceptores.length > 0) {
          await this.sendToUsers(
            listReceptores,
            "Firma del Receptor Confirmada",
            `Has firmado exitosamente el contrato de traslado ${movement.codigo_movimiento} como receptor. El traslado se ha completado.`
          );
        }
        // Notificar a emisores
        if (listEmisores.length > 0) {
          await this.sendToUsers(
            listEmisores,
            "Traslado Completado",
            `El receptor ha firmado el contrato de traslado ${movement.codigo_movimiento}. El traslado de tu activo se ha completado.`
          );
        }
      }
    } catch (err: any) {
      console.error("Error sending movement signed notification:", err.message || err);
    }
  }

  async notifyPdfDownloaded(userId: number, reportType: string, detail: string) {
    try {
      const user = await prisma.usuario.findUnique({
        where: { id: userId }
      });
      if (!user || user.rol_id === 1) return; // No notificar a admins

      const msg = `Has descargado el reporte PDF de ${reportType}: ${detail}.`;
      await this.sendToUsers([String(userId)], "Descarga de Reporte PDF", msg);
    } catch (err: any) {
      console.error("Error sending PDF downloaded notification:", err.message || err);
    }
  }
}

export const notificationService = new NotificationService();