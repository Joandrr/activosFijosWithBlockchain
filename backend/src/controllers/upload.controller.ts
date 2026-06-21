import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
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

    // Construct the public S3 URL
    const fileUrl = `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${fileName}`;

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
