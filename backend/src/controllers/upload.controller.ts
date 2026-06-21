import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { env } from "../config/env.js";
import type { Request, Response } from "express";

const s3 = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export async function uploadImage(req: Request, res: Response): Promise<void> {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: "No se proporcionó ningún archivo de imagen." });
      return;
    }

    if (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY) {
      res.status(500).json({ error: "Las credenciales de AWS S3 no están configuradas en el servidor." });
      return;
    }

    // Generate a unique filename using timestamp and a random string
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = file.originalname.split(".").pop();
    const fileName = `activos/img-${uniqueSuffix}.${extension}`;

    const uploadParams = {
      Bucket: env.AWS_S3_BUCKET,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    await s3.send(new PutObjectCommand(uploadParams));

    // Construct the backend proxy URL (supports BACKEND_URL env override and x-forwarded headers)
    let fileUrl = "";
    if (process.env.BACKEND_URL) {
      const baseUrl = process.env.BACKEND_URL.endsWith("/")
        ? process.env.BACKEND_URL.slice(0, -1)
        : process.env.BACKEND_URL;
      fileUrl = `${baseUrl}/api/upload/image/${fileName}`;
    } else {
      const protocol = req.headers["x-forwarded-proto"] || req.protocol;
      const host = req.headers["x-forwarded-host"] || req.get("host");
      fileUrl = `${protocol}://${host}/api/upload/image/${fileName}`;
    }

    res.status(200).json({
      success: true,
      data: {
        url: fileUrl,
      },
    });
  } catch (error) {
    console.error("❌ Error al subir imagen a S3:", error);
    res.status(500).json({ error: "Error interno al subir la imagen a AWS S3." });
  }
}

export async function serveImage(req: Request, res: Response): Promise<void> {
  try {
    // Express named parameter key (supports wildcard /image/:key(.*))
    const rawKey = req.params.key || req.params[0];
    const key = (Array.isArray(rawKey) ? rawKey.join("/") : rawKey) as string;
    if (!key) {
      res.status(400).json({ error: "Falta especificar la clave de la imagen." });
      return;
    }

    const command = new GetObjectCommand({
      Bucket: env.AWS_S3_BUCKET,
      Key: key,
    });

    const response = await s3.send(command);

    if (response.ContentType) {
      res.setHeader("Content-Type", response.ContentType);
    }
    if (response.ContentLength) {
      res.setHeader("Content-Length", response.ContentLength);
    }

    // Set cache control for performance
    res.setHeader("Cache-Control", "public, max-age=31536000");

    const stream = response.Body as any;
    if (stream && typeof stream.pipe === "function") {
      stream.pipe(res);
    } else {
      const bytes = await response.Body?.transformToByteArray();
      if (bytes) {
        res.send(Buffer.from(bytes));
      } else {
        res.status(404).json({ error: "No se pudo leer el archivo de S3." });
      }
    }
  } catch (error: any) {
    console.error("❌ Error al servir imagen desde S3:", error);
    if (error.name === "NoSuchKey") {
      res.status(404).json({ error: "La imagen solicitada no existe." });
    } else {
      res.status(500).json({ error: "Error al recuperar la imagen desde AWS S3." });
    }
  }
}
