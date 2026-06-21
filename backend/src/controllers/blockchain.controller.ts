import type { Request, Response } from "express";

const NOTARY_SERVICE_URL = process.env.NOTARY_SERVICE_URL || "http://service-go:3000";

// Helper for fetching data from the Go notary service
async function forwardRequest(url: string, res: Response) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      res.status(response.status).send(errorText);
      return;
    }
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error(`❌ Error proxying to Go Service (${url}):`, error);
    res.status(500).json({ error: "Error de comunicación con el servicio Blockchain." });
  }
}

export async function getContracts(req: Request, res: Response): Promise<void> {
  await forwardRequest(`${NOTARY_SERVICE_URL}/contracts`, res);
}

export async function getContractById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  await forwardRequest(`${NOTARY_SERVICE_URL}/contracts/${id}`, res);
}

export async function verifyContract(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  await forwardRequest(`${NOTARY_SERVICE_URL}/contracts/${id}/verify`, res);
}

export async function getSignatures(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  await forwardRequest(`${NOTARY_SERVICE_URL}/contracts/${id}/signatures`, res);
}

export async function getAuditLogs(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  await forwardRequest(`${NOTARY_SERVICE_URL}/contracts/${id}/audit`, res);
}
