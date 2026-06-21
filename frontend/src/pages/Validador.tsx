import { useState, useEffect } from "react";
import { FiSearch, FiShield, FiCheckCircle, FiClock, FiFileText, FiUser, FiActivity } from "react-icons/fi";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

interface Contract {
  id: string;
  title: string;
  document_hash: string;
  digital_signature: string;
  status: string;
  pdf_base64?: string;
}

interface Signature {
  contract_id: string;
  signer_type: string;
  document_hash: string;
  signature_url: string;
  timestamp: string;
}

interface AuditLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  payload: string;
  timestamp: string;
}

export default function Validador() {
  const [searchParams] = useSearchParams();
  const [searchId, setSearchId] = useState("");
  const [loading, setLoading] = useState(false);
  const [contract, setContract] = useState<Contract | null>(null);
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [verification, setVerification] = useState<{ valid: boolean; message?: string; error?: string } | null>(null);
  
  const [recentContracts, setRecentContracts] = useState<Contract[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(false);

  const GO_SERVICE_URL = import.meta.env.VITE_GO_SERVICE_URL || "http://localhost:3030";

  // Load recent contracts
  const loadRecent = async () => {
    setLoadingRecent(true);
    try {
      const res = await axios.get<Contract[]>(`${GO_SERVICE_URL}/contracts`);
      setRecentContracts(res.data.reverse().slice(0, 5)); // Latest 5 contracts
    } catch (err) {
      console.error("Error fetching recent contracts:", err);
    } finally {
      setLoadingRecent(false);
    }
  };

  const handleVerify = async (id: string) => {
    if (!id.trim()) return;
    setLoading(true);
    setContract(null);
    setSignatures([]);
    setAuditLogs([]);
    setVerification(null);

    try {
      // Fetch Contract Details
      const resContract = await axios.get<Contract>(`${GO_SERVICE_URL}/contracts/${id}`);
      setContract(resContract.data);

      // Fetch Verification Status
      try {
        const resVerify = await axios.get<{ valid: boolean; error?: string }>(`${GO_SERVICE_URL}/contracts/${id}/verify`);
        setVerification({
          valid: resVerify.data.valid,
          message: resVerify.data.valid ? "Sello y hash criptográfico válidos. Datos íntegros en DynamoDB." : "Firma no válida.",
          error: resVerify.data.error,
        });
      } catch (err) {
        setVerification({
          valid: false,
          error: "Error al realizar chequeo criptográfico.",
        });
      }

      // Fetch Signatures
      try {
        const resSigs = await axios.get<Signature[]>(`${GO_SERVICE_URL}/contracts/${id}/signatures`);
        setSignatures(resSigs.data || []);
      } catch {}

      // Fetch Audit Logs
      try {
        const resAudit = await axios.get<AuditLog[]>(`${GO_SERVICE_URL}/contracts/${id}/audit`);
        setAuditLogs(resAudit.data || []);
      } catch {}

    } catch (err) {
      alert("Contrato no encontrado en el ledger de DynamoDB.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecent();
    const idParam = searchParams.get("id");
    if (idParam) {
      setSearchId(idParam);
      handleVerify(idParam);
    }
  }, [searchParams]);

  // Helper to decode Base64 payload back to readable JSON string
  const getDecodedPayload = (base64Str?: string) => {
    if (!base64Str) return "{}";
    try {
      return atob(base64Str);
    } catch {
      return "{}";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-350">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-100">Validador Notarial</h1>
        <p className="text-sm text-slate-400 mt-0.5">Auditoría criptográfica y explorador de firmas en DynamoDB</p>
      </div>

      {/* Buscador */}
      <div className="bg-slate-900/40 backdrop-blur-xl p-6 border border-white/5 rounded-3xl shadow-xl space-y-4">
        <h3 className="font-bold text-slate-200 text-sm">Verificar Contrato por ID (UUID)</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Pega el UUID del contrato (ej. 3d2b7c4d-...)"
              className="w-full pl-11 pr-4 py-3 bg-slate-950/40 border border-white/10 rounded-2xl text-sm text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-mono transition-all"
            />
          </div>
          <button
            onClick={() => handleVerify(searchId)}
            disabled={loading || !searchId.trim()}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
          >
            {loading ? "Verificando..." : "Auditar Contrato"}
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-12 space-y-3">
          <div className="w-10 h-10 border-4 border-slate-800 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-sm text-slate-400 font-medium animate-pulse">Consultando ledger de DynamoDB...</p>
        </div>
      )}

      {/* RESULTADOS DE AUDITORÍA */}
      {!loading && contract && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Columna Izquierda: Información y Validación */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Tarjeta de Validación Criptográfica */}
            <div className={`rounded-3xl p-6 border shadow-lg backdrop-blur-xl ${
              verification?.valid
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-200"
                : "bg-rose-500/10 border-rose-500/20 text-rose-200"
            }`}>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-2xl ${
                  verification?.valid 
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" 
                    : "bg-rose-600 text-white shadow-lg shadow-rose-600/20"
                }`}>
                  <FiShield size={24} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-base uppercase tracking-wider">
                    {verification?.valid ? "Matemáticamente Verificado" : "Fallo de Validación"}
                  </h4>
                  <p className="text-sm opacity-90">{verification?.message || verification?.error}</p>
                  <p className="text-[10px] opacity-70 font-mono mt-1">Algoritmo: RSA-SHA256 Notarization Seal</p>
                </div>
              </div>
            </div>

            {/* Detalles del Contrato */}
            <div className="bg-slate-900/30 backdrop-blur-xl rounded-3xl p-6 border border-white/5 shadow-xl space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                <FiFileText size={18} className="text-indigo-400" />
                <h4 className="font-bold text-slate-200 text-sm">Metadatos del Ledger</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400">Título / Concepto</span>
                  <p className="font-bold text-slate-200 mt-0.5">{contract.title}</p>
                </div>
                <div>
                  <span className="text-slate-400">UUID Contrato</span>
                  <p className="font-mono font-semibold text-indigo-400 mt-0.5">{contract.id}</p>
                </div>
                <div className="md:col-span-2">
                  <span className="text-slate-400">SHA-256 Hash del Documento</span>
                  <p className="font-mono text-slate-300 mt-0.5 break-all bg-slate-950/40 p-3 rounded-xl border border-white/5">{contract.document_hash}</p>
                </div>
                <div className="md:col-span-2">
                  <span className="text-slate-400">Sello de Firma Digital Notarial (RSA-Signature)</span>
                  <p className="font-mono text-slate-300 mt-0.5 break-all bg-slate-950/40 p-3 rounded-xl border border-white/5 text-[10px] max-h-24 overflow-y-auto">
                    {contract.digital_signature}
                  </p>
                </div>
              </div>
            </div>

            {/* Payload Detalle (JSON original) */}
            <div className="bg-slate-900/30 backdrop-blur-xl rounded-3xl p-6 border border-white/5 shadow-xl space-y-4">
              <div className="flex items-center gap-2">
                <FiFileText size={18} className="text-indigo-400" />
                <h4 className="font-bold text-slate-200 text-sm">Payload de Datos Íntegros (JSON)</h4>
              </div>
              <div className="relative">
                <pre className="bg-slate-950 text-emerald-400 p-4 rounded-2xl text-xs font-mono overflow-x-auto border border-white/5 shadow-inner max-h-60">
                  {JSON.stringify(JSON.parse(getDecodedPayload(contract.pdf_base64)), null, 2)}
                </pre>
              </div>
            </div>

          </div>

          {/* Columna Derecha: Firmas y Auditoría */}
          <div className="space-y-6">
            
            {/* Lista de Firmantes */}
            <div className="bg-slate-900/30 backdrop-blur-xl rounded-3xl p-6 border border-white/5 shadow-xl space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                <FiUser size={18} className="text-indigo-400" />
                <h4 className="font-bold text-slate-200 text-sm">Firmas Estampadas</h4>
              </div>

              <div className="space-y-3">
                {signatures.map((sig, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                      <FiCheckCircle size={14} />
                    </span>
                    <div className="space-y-0.5 text-xs">
                      <p className="font-bold text-slate-200">{sig.signer_type}</p>
                      <p className="text-slate-400 text-[10px]">Rol verificado y sellado</p>
                      <p className="font-mono text-[9px] text-indigo-400 break-all">{sig.document_hash.substring(0, 24)}...</p>
                      {sig.signature_url && (sig.signature_url.startsWith("http://") || sig.signature_url.startsWith("https://")) && (
                        <div className="mt-1">
                          <a
                            href={sig.signature_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 hover:underline font-semibold transition-all"
                          >
                            📄 Ver Documento en S3
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {signatures.length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-4">Ninguna firma estampada aún.</p>
                )}
              </div>
            </div>

            {/* Audit Trail de DynamoDB */}
            <div className="bg-slate-900/30 backdrop-blur-xl rounded-3xl p-6 border border-white/5 shadow-xl space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                <FiActivity size={18} className="text-indigo-400" />
                <h4 className="font-bold text-slate-200 text-sm">Bitácora de Auditoría</h4>
              </div>

              <div className="relative border-l border-white/5 ml-2 pl-4 space-y-4 text-xs">
                {auditLogs.map((log) => (
                  <div key={log.id} className="relative">
                    <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-slate-950" />
                    <div>
                      <h5 className="font-bold text-slate-200">{log.action}</h5>
                      <p className="text-slate-400 text-[10px]">{log.timestamp.replace("T", " ").split(".")[0]}</p>
                      <p className="text-slate-300 text-[10px] mt-0.5">Actor: {log.payload}</p>
                    </div>
                  </div>
                ))}
                {auditLogs.length === 0 && (
                  <p className="text-slate-550 text-center py-4">Sin registros de auditoría.</p>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* PANEL DE CONTRATOS RECIENTES */}
      {!loading && !contract && (
        <div className="bg-slate-900/30 backdrop-blur-xl rounded-3xl p-6 border border-white/5 shadow-xl space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 pb-3 border-b border-white/5">
            <FiClock size={18} className="text-indigo-400" />
            <h4 className="font-bold text-slate-200 text-sm">Últimos Contratos Notarizados</h4>
          </div>

          {loadingRecent ? (
            <div className="text-center py-6 text-xs text-slate-400 animate-pulse">Cargando lista...</div>
          ) : (
            <div className="divide-y divide-white/5 text-xs">
              {recentContracts.map((c) => (
                <div key={c.id} className="py-3 flex items-center justify-between gap-4 hover:bg-white/5 rounded-xl px-2 transition-colors">
                  <div className="space-y-1">
                    <p className="font-bold text-slate-200">{c.title}</p>
                    <p className="font-mono text-[10px] text-indigo-400">{c.id}</p>
                  </div>
                  <button
                    onClick={() => {
                      setSearchId(c.id);
                      handleVerify(c.id);
                    }}
                    className="px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Auditar
                  </button>
                </div>
              ))}
              {recentContracts.length === 0 && (
                <p className="text-slate-500 text-center py-6">Ningún contrato registrado en el ledger aún.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
