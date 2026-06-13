import { Buffer } from "buffer";

const NOTARY_SERVICE_URL = process.env.NOTARY_SERVICE_URL || "http://service-go:3000";

export interface ContractResponse {
  contract_id: string;
  document_hash: string;
  digital_signature: string;
  status: string;
}

/**
 * Registra un contrato en el servicio Go Notary.
 */
export async function createNotaryContract(title: string, payload: any): Promise<ContractResponse | null> {
  try {
    const jsonStr = JSON.stringify(payload);
    const pdfBase64 = Buffer.from(jsonStr).toString("base64");

    const response = await fetch(`${NOTARY_SERVICE_URL}/contracts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, pdf_base64: pdfBase64 }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Error al crear contrato notarial:", errorText);
      return null;
    }

    const data = (await response.json()) as any;
    return {
      contract_id: data.contract_id,
      document_hash: data.document_hash,
      digital_signature: data.digital_signature,
      status: data.status,
    };
  } catch (error) {
    console.error("❌ Error de comunicación con service-go en createNotaryContract:", error);
    return null;
  }
}

/**
 * Añade una firma a un contrato existente en el servicio Go Notary.
 */
export async function signNotaryContract(
  contractId: string,
  signerType: string,
  documentHash: string,
  signatureUrl: string = ""
): Promise<boolean> {
  try {
    const response = await fetch(`${NOTARY_SERVICE_URL}/contracts/${contractId}/sign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        signer_type: signerType,
        document_hash: documentHash,
        signature_url: signatureUrl,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Error al firmar contrato notarial:", errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error("❌ Error de comunicación con service-go en signNotaryContract:", error);
    return false;
  }
}
