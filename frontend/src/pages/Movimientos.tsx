import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DataTable from "../components/DataTable";
import {
  movimientoService,
  signReceptor,
  signEmisor,
  activoService,
  lugarService,
  usuarioService,
  responsableLugarService,
} from "../services";
import type { Movimiento, Activo, Lugar, Usuario, ResponsableLugar } from "../types";
import { AxiosError } from "axios";
import { FiX, FiShield, FiGrid, FiClock, FiCheckCircle, FiMapPin, FiInfo, FiPlus, FiTag, FiCalendar, FiFileText, FiUser, FiSettings, FiAlertCircle } from "react-icons/fi";

interface SelectOption {
  value: number;
  label: string;
}

export default function Movimientos() {
  const [data, setData] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMov, setSelectedMov] = useState<Movimiento | null>(null);
  const [signing, setSigning] = useState(false);
  const [signingEmisor, setSigningEmisor] = useState(false);

  // Auto filtering states
  const [activos, setActivos] = useState<Activo[]>([]);
  const [responsablesLugar, setResponsablesLugar] = useState<ResponsableLugar[]>([]);
  const [originResponsableName, setOriginResponsableName] = useState("");
  const [destResponsableName, setDestResponsableName] = useState("");

  // Modal form states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | string | null>(null);
  const [form, setForm] = useState({
    codigo_movimiento: "",
    activo_id: "",
    fecha_movimiento: new Date().toISOString().split("T")[0],
    observaciones: "",
    estado_movimiento_id: "1", // Defaults to En Proceso
    estado_activo_id: "1", // Defaults to Disponible
    lugar_origen_id: "",
    lugar_destino_id: "",
    usuario_id: ""
  });
  const [saving, setSaving] = useState(false);

  // Dropdown options
  const [activoOptions, setActivoOptions] = useState<SelectOption[]>([]);
  const [lugarOptions, setLugarOptions] = useState<SelectOption[]>([]);
  const [usuarioOptions, setUsuarioOptions] = useState<SelectOption[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const [resMovimientos, resActivos, resLugares, resUsuarios, resResponsables] = await Promise.all([
        movimientoService.getAll(),
        activoService.getAll(),
        lugarService.getAll(),
        usuarioService.getAll(),
        responsableLugarService.getAll(),
      ]);
      setData(resMovimientos);
      setActivos(resActivos);
      setResponsablesLugar(resResponsables);
      setActivoOptions(resActivos.map((x: Activo) => ({ value: x.id, label: `${x.codigo} - ${x.nombre}` })));
      setLugarOptions(resLugares.map((x: Lugar) => ({ value: x.id, label: x.nombre })));
      setUsuarioOptions(resUsuarios.map((x: Usuario) => ({ value: x.id, label: `${x.nombre} ${x.apellido}` })));
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: number | string) => {
    if (!confirm("¿Eliminar este registro de movimiento?")) return;
    try {
      await movimientoService.remove(id);
      setData((prev) => prev.filter((d) => d.id !== id));
    } catch (err: unknown) {
      alert(err instanceof AxiosError ? err.response?.data?.message : "Error al eliminar");
    }
  };

  const handleSimulateSign = async (id: number) => {
    setSigning(true);
    try {
      await signReceptor(id);
      // Reload and update selectedMov with fresh data
      const res = await movimientoService.getAll();
      setData(res);
      const updated = res.find((m: Movimiento) => m.id === id);
      setSelectedMov(updated ?? null);
    } catch (err: unknown) {
      alert(err instanceof AxiosError ? err.response?.data?.message : "Error al firmar receptor");
    } finally {
      setSigning(false);
    }
  };

  const handleSimulateSignEmisor = async (id: number) => {
    setSigningEmisor(true);
    try {
      await signEmisor(id);
      const res = await movimientoService.getAll();
      setData(res);
      const updated = res.find((m: Movimiento) => m.id === id);
      setSelectedMov(updated ?? null);
    } catch (err: unknown) {
      alert(err instanceof AxiosError ? err.response?.data?.message : "Error al firmar emisor");
    } finally {
      setSigningEmisor(false);
    }
  };

  const openCreateModal = () => {
    // Generate correlative code automatically
    const nextNum = data.length > 0
      ? Math.max(...data.map(m => {
          const num = parseInt(m.codigo_movimiento.replace(/[^\d]/g, ""), 10);
          return isNaN(num) ? 0 : num;
        })) + 1
      : 1;
    const nextCode = `MOV-${String(nextNum).padStart(3, "0")}`;

    setForm({
      codigo_movimiento: nextCode,
      activo_id: "",
      fecha_movimiento: new Date().toISOString().split("T")[0],
      observaciones: "",
      estado_movimiento_id: "1", // defaults to En Proceso
      estado_activo_id: "1", // defaults to Disponible
      lugar_origen_id: "",
      lugar_destino_id: "",
      usuario_id: ""
    });
    setOriginResponsableName("");
    setDestResponsableName("");
    setEditId(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (id: number | string) => {
    const item = data.find((d) => d.id === id);
    if (item) {
      setForm({
        codigo_movimiento: item.codigo_movimiento,
        activo_id: item.activo_id ? String(item.activo_id) : "",
        fecha_movimiento: item.fecha_movimiento ? item.fecha_movimiento.split("T")[0] : new Date().toISOString().split("T")[0],
        observaciones: item.observaciones || "",
        estado_movimiento_id: item.estado_movimiento_id ? String(item.estado_movimiento_id) : "1",
        estado_activo_id: item.estado_activo_id ? String(item.estado_activo_id) : "1",
        lugar_origen_id: item.lugar_origen_id ? String(item.lugar_origen_id) : "",
        lugar_destino_id: item.lugar_destino_id ? String(item.lugar_destino_id) : "",
        usuario_id: item.usuario_id ? String(item.usuario_id) : ""
      });

      // Resolve responsible names for origin and destination
      const origResp = responsablesLugar.find(r => r.lugar_id === item.lugar_origen_id);
      const destResp = responsablesLugar.find(r => r.lugar_id === item.lugar_destino_id);
      
      const origUserOpt = origResp ? usuarioOptions.find(u => Number(u.value) === origResp.usuario_id) : null;
      const destUserOpt = destResp ? usuarioOptions.find(u => Number(u.value) === destResp.usuario_id) : null;

      setOriginResponsableName(origUserOpt ? origUserOpt.label : "");
      setDestResponsableName(destUserOpt ? destUserOpt.label : "");

      setEditId(id);
      setIsFormModalOpen(true);
    }
  };

  const handleActivoChange = (activoId: string) => {
    const asset = activos.find(a => String(a.id) === activoId);
    let nextOrigenId = "";
    let nextUsuarioId = "";
    let nextOriginName = "";

    if (asset) {
      nextOrigenId = String(asset.lugar_id);
      // Find responsible for this origin
      const resp = responsablesLugar.find(r => r.lugar_id === asset.lugar_id);
      if (resp) {
        nextUsuarioId = String(resp.usuario_id);
        const userOpt = usuarioOptions.find(u => Number(u.value) === resp.usuario_id);
        nextOriginName = userOpt ? userOpt.label : "Auxiliar Asignado";
      } else {
        nextOriginName = "Sin Auxiliar responsable de este Origen";
      }
    }
    
    setForm(prev => ({
      ...prev,
      activo_id: activoId,
      lugar_origen_id: nextOrigenId,
      usuario_id: nextUsuarioId
    }));
    setOriginResponsableName(nextOriginName);
  };

  const handleOrigenChange = (origenId: string) => {
    let nextUsuarioId = "";
    let nextOriginName = "";
    if (origenId) {
      const resp = responsablesLugar.find(r => r.lugar_id === Number(origenId));
      if (resp) {
        nextUsuarioId = String(resp.usuario_id);
        const userOpt = usuarioOptions.find(u => Number(u.value) === resp.usuario_id);
        nextOriginName = userOpt ? userOpt.label : "Auxiliar Asignado";
      } else {
        nextOriginName = "Sin Auxiliar responsable de este Origen";
      }
    }

    setForm(prev => ({
      ...prev,
      lugar_origen_id: origenId,
      usuario_id: nextUsuarioId
    }));
    setOriginResponsableName(nextOriginName);
  };

  const handleDestinoChange = (destinoId: string) => {
    let nextDestName = "";
    if (destinoId) {
      const resp = responsablesLugar.find(r => r.lugar_id === Number(destinoId));
      if (resp) {
        const userOpt = usuarioOptions.find(u => Number(u.value) === resp.usuario_id);
        nextDestName = userOpt ? userOpt.label : "Auxiliar Asignado";
      } else {
        nextDestName = "Sin Auxiliar responsable de este Destino";
      }
    }

    setForm(prev => ({
      ...prev,
      lugar_destino_id: destinoId
    }));
    setDestResponsableName(nextDestName);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        activo_id: form.activo_id ? Number(form.activo_id) : undefined,
        estado_movimiento_id: form.estado_movimiento_id ? Number(form.estado_movimiento_id) : undefined,
        estado_activo_id: form.estado_activo_id ? Number(form.estado_activo_id) : undefined,
        lugar_origen_id: form.lugar_origen_id ? Number(form.lugar_origen_id) : undefined,
        lugar_destino_id: form.lugar_destino_id ? Number(form.lugar_destino_id) : undefined,
        usuario_id: form.usuario_id ? Number(form.usuario_id) : undefined
      };

      if (editId) {
        await movimientoService.update(editId, payload);
      } else {
        await movimientoService.create(payload);
      }
      setIsFormModalOpen(false);
      load();
    } catch (err: unknown) {
      alert(err instanceof AxiosError ? err.response?.data?.message : "Error al guardar movimiento");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Movimientos</h1>
          <p className="text-sm text-slate-400 mt-0.5">Control y doble firma criptográfica en el traslado de activos</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-600/15 cursor-pointer"
        >
          <FiPlus size={16} /> Nuevo Movimiento
        </button>
      </div>

      <DataTable<Movimiento>
        columns={[
          { key: "codigo_movimiento", label: "Código" },
          { key: "activo_nombre", label: "Activo" },
          { key: "fecha_movimiento", label: "Fecha" },
          { key: "lugar_origen_nombre", label: "Origen" },
          { key: "lugar_destino_nombre", label: "Destino" },
          {
            key: "firma_emisor",
            label: "Firma Emisor",
            render: (v) => {
              if (v) {
                return (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <FiCheckCircle size={12} /> Firmado
                  </span>
                );
              }
              return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20 animate-pulse">
                  <FiClock size={12} /> Pendiente
                </span>
              );
            },
          },
          {
            key: "firma_receptor",
            label: "Firma Receptor",
            render: (v, item) => {
              if (v) {
                return (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <FiCheckCircle size={12} /> Firmado
                  </span>
                );
              }
              if (!item.firma_emisor) {
                return (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-700/50 text-slate-500 border border-slate-600/20">
                    <FiAlertCircle size={12} /> Espera Emisor
                  </span>
                );
              }
              return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20 animate-pulse">
                  <FiClock size={12} /> Pendiente
                </span>
              );
            },
          },
          {
            key: "contrato_uuid",
            label: "Sello Digital",
            render: (v) => {
              return v ? (
                <Link
                  to={`/validador?id=${v}`}
                  className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 hover:underline font-semibold"
                >
                  <FiShield size={12} className="text-indigo-500 shrink-0" /> Auditar
                </Link>
              ) : (
                <span className="text-slate-500 text-xs italic">Sin contrato</span>
              );
            },
          },
          {
            key: "qr_firma",
            label: "Acciones Firma",
            render: (_, item) => {
              if (item.estado_movimiento_id === 2) {
                return (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <FiShield size={12} /> Ejecutado
                  </span>
                );
              }
              return (
                <button
                  onClick={() => setSelectedMov(item)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-300 hover:text-indigo-200 bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-xl border border-indigo-500/20 transition-all cursor-pointer"
                >
                  <FiGrid size={13} /> Panel Firmas
                </button>
              );
            },
          },
        ]}
        data={data}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchPlaceholder="Buscar movimiento..."
      />

      {/* FORM MODAL (CREATE / EDIT) */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-opacity duration-300">
          <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl w-full max-w-lg border border-white/10 shadow-2xl overflow-hidden relative transform transition-all text-slate-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <h2 className="text-lg font-bold text-slate-100">
                {editId ? "Editar Movimiento" : "Registrar Nuevo Movimiento"}
              </h2>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-350 mb-1.5 flex items-center gap-1.5">
                    <FiTag className="text-indigo-400" /> Código Movimiento *
                  </label>
                  <input
                    type="text"
                    required
                    readOnly
                    value={form.codigo_movimiento}
                    onChange={(e) => setForm({ ...form, codigo_movimiento: e.target.value })}
                    placeholder="Ej. MOV-010"
                    className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-white/10 rounded-xl text-sm text-slate-400 focus:outline-none cursor-not-allowed font-mono"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-350 mb-1.5 flex items-center gap-1.5">
                    <FiSettings className="text-indigo-400" /> Activo a Mover *
                  </label>
                  <select
                    required
                    value={form.activo_id}
                    onChange={(e) => handleActivoChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  >
                    <option value="" className="bg-slate-950 text-slate-300">Seleccionar activo...</option>
                    {activoOptions.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-slate-950 text-slate-200">{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-350 mb-1.5 flex items-center gap-1.5">
                  <FiCalendar className="text-indigo-400" /> Fecha del Movimiento *
                </label>
                <input
                  type="date"
                  required
                  value={form.fecha_movimiento}
                  onChange={(e) => setForm({ ...form, fecha_movimiento: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950/40 border border-white/10 rounded-xl text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all [color-scheme:dark]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-350 mb-1.5 flex items-center gap-1.5">
                  <FiFileText className="text-indigo-400" /> Observaciones
                </label>
                <textarea
                  value={form.observaciones}
                  onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
                  placeholder="Detalles sobre el traslado, estado actual, etc..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-slate-955/40 text-slate-200 placeholder-slate-500 border border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-350 mb-1.5 flex items-center gap-1.5">
                    <FiMapPin className="text-indigo-400" /> Origen *
                  </label>
                  <select
                    required
                    value={form.lugar_origen_id}
                    onChange={(e) => handleOrigenChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-955 border border-white/10 rounded-xl text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  >
                    <option value="" className="bg-slate-955 text-slate-300">Seleccionar origen...</option>
                    {lugarOptions.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-slate-955 text-slate-200">{opt.label}</option>
                    ))}
                  </select>
                  {originResponsableName && (
                    <p className="text-[11px] text-indigo-400 mt-1 italic">
                      👤 Emisor: {originResponsableName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-350 mb-1.5 flex items-center gap-1.5">
                    <FiMapPin className="text-indigo-400" /> Destino *
                  </label>
                  <select
                    required
                    value={form.lugar_destino_id}
                    onChange={(e) => handleDestinoChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-955 border border-white/10 rounded-xl text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  >
                    <option value="" className="bg-slate-955 text-slate-300">Seleccionar destino...</option>
                    {lugarOptions.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-slate-955 text-slate-200">{opt.label}</option>
                    ))}
                  </select>
                  {destResponsableName && (
                    <p className="text-[11px] text-indigo-400 mt-1 italic">
                      👤 Receptor: {destResponsableName}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-350 mb-1.5 flex items-center gap-1.5">
                  <FiUser className="text-indigo-400" /> Auxiliar Emisor Responsable
                </label>
                <select
                  disabled
                  value={form.usuario_id}
                  onChange={(e) => setForm({ ...form, usuario_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950/40 border border-white/10 rounded-xl text-sm text-slate-400 cursor-not-allowed font-medium"
                >
                  <option value="" className="bg-slate-955 text-slate-300">Sin auxiliar asignado...</option>
                  {usuarioOptions.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-slate-955 text-slate-200">{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4.5 py-2.5 rounded-xl border border-white/10 text-slate-300 text-sm font-medium hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4.5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer shadow-lg shadow-indigo-600/20"
                >
                  {saving ? "Guardando..." : editId ? "Guardar Cambios" : "Crear Movimiento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PANEL DE DOBLE FIRMA */}
      {selectedMov && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/10 animate-in fade-in zoom-in-95 duration-150 text-slate-100">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/5">
              <div>
                <h3 className="font-bold text-slate-100 text-lg flex items-center gap-2">
                  <FiShield className="text-indigo-400" /> Panel de Doble Firma
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Movimiento: <span className="font-mono text-indigo-400 font-bold">{selectedMov.codigo_movimiento}</span></p>
              </div>
              <button
                onClick={() => setSelectedMov(null)}
                className="p-1.5 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Info del movimiento */}
              <div className="bg-slate-950/50 border border-white/5 rounded-2xl p-4 text-xs text-slate-350 space-y-1.5">
                <p className="flex items-center gap-1.5"><strong className="text-slate-200">Activo:</strong> {selectedMov.activo_nombre}</p>
                <p className="flex items-center gap-1.5"><FiMapPin size={12} className="text-slate-450" /> <strong className="text-slate-200">Origen:</strong> {selectedMov.lugar_origen_nombre}</p>
                <p className="flex items-center gap-1.5"><FiMapPin size={12} className="text-indigo-400" /> <strong className="text-slate-200">Destino:</strong> {selectedMov.lugar_destino_nombre}</p>
                {selectedMov.contrato_uuid && (
                  <p className="flex items-center gap-1.5">
                    <FiShield size={12} className="text-indigo-400 shrink-0" />
                    <strong className="text-slate-200">Contrato:</strong>{" "}
                    <Link
                      to={`/validador?id=${selectedMov.contrato_uuid}`}
                      className="text-indigo-400 hover:text-indigo-300 hover:underline font-semibold"
                    >
                      {selectedMov.contrato_uuid.substring(0, 8)}... (Auditar)
                    </Link>
                  </p>
                )}
              </div>

              {/* Estado de las dos firmas */}
              <div className="grid grid-cols-2 gap-3">
                {/* Firma Emisor */}
                <div className={`rounded-2xl p-4 border ${
                  selectedMov.firma_emisor
                    ? "bg-emerald-500/5 border-emerald-500/20"
                    : "bg-amber-500/5 border-amber-500/20"
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      selectedMov.firma_emisor ? "bg-emerald-500/20" : "bg-amber-500/20"
                    }`}>
                      {selectedMov.firma_emisor
                        ? <FiCheckCircle className="text-emerald-400" size={16} />
                        : <FiClock className="text-amber-400" size={16} />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-200">Firma Emisor</p>
                      <p className="text-[10px] text-slate-400">{selectedMov.lugar_origen_nombre}</p>
                    </div>
                  </div>
                  {selectedMov.firma_emisor ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      <FiCheckCircle size={9} /> Completada
                    </span>
                  ) : (
                    <>
                      <p className="text-[10px] text-amber-300/70 mb-2">Pendiente de firma</p>
                      <button
                        onClick={() => handleSimulateSignEmisor(selectedMov.id)}
                        disabled={signingEmisor}
                        className="w-full py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl text-[10px] font-bold transition-all border border-amber-500/20 disabled:opacity-50 cursor-pointer"
                      >
                        {signingEmisor ? "Firmando..." : "✍️ Firmar Emisor"}
                      </button>
                    </>
                  )}
                </div>

                {/* Firma Receptor */}
                <div className={`rounded-2xl p-4 border ${
                  selectedMov.firma_receptor
                    ? "bg-emerald-500/5 border-emerald-500/20"
                    : selectedMov.firma_emisor
                      ? "bg-amber-500/5 border-amber-500/20"
                      : "bg-slate-800/40 border-slate-700/30"
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      selectedMov.firma_receptor
                        ? "bg-emerald-500/20"
                        : selectedMov.firma_emisor
                          ? "bg-amber-500/20"
                          : "bg-slate-700/30"
                    }`}>
                      {selectedMov.firma_receptor
                        ? <FiCheckCircle className="text-emerald-400" size={16} />
                        : selectedMov.firma_emisor
                          ? <FiClock className="text-amber-400" size={16} />
                          : <FiAlertCircle className="text-slate-500" size={16} />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-200">Firma Receptor</p>
                      <p className="text-[10px] text-slate-400">{selectedMov.lugar_destino_nombre}</p>
                    </div>
                  </div>
                  {selectedMov.firma_receptor ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      <FiCheckCircle size={9} /> Completada
                    </span>
                  ) : !selectedMov.firma_emisor ? (
                    <p className="text-[10px] text-slate-500">Esperando firma del emisor</p>
                  ) : (
                    <>
                      <p className="text-[10px] text-amber-300/70 mb-2">Pendiente de firma</p>
                      <button
                        onClick={() => handleSimulateSign(selectedMov.id)}
                        disabled={signing}
                        className="w-full py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded-xl text-[10px] font-bold transition-all border border-indigo-500/20 disabled:opacity-50 cursor-pointer"
                      >
                        {signing ? "Firmando..." : "✍️ Firmar Receptor"}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* QR Section — uno por cada firma */}
              {(!selectedMov.firma_emisor || !selectedMov.firma_receptor) && (
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-2 text-center">
                    Códigos QR · Escanear desde Flutter
                  </p>
                  <div className={`grid gap-3 ${!selectedMov.firma_emisor && !selectedMov.firma_receptor ? "grid-cols-2" : "grid-cols-1"}`}>
                    {/* QR Emisor */}
                    {!selectedMov.firma_emisor && (
                      <div className="flex flex-col items-center bg-slate-950/50 rounded-2xl p-3 border border-amber-500/20">
                        <div className="text-[9px] font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                          </span>
                          Paso 1 · Emisor
                        </div>
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(
                            `activos-app://sign-movement?id=${selectedMov.id}&contract=${selectedMov.contrato_uuid ?? ""}&step=emisor`
                          )}`}
                          alt="QR Firma Emisor"
                          className="w-32 h-32 bg-white p-1.5 rounded-xl shadow-inner border border-amber-500/20"
                        />
                        <p className="text-[9px] text-amber-300/60 mt-1.5 text-center">{selectedMov.lugar_origen_nombre}</p>
                      </div>
                    )}
                    {/* QR Receptor */}
                    {!selectedMov.firma_receptor && (
                      <div className={`flex flex-col items-center rounded-2xl p-3 border ${
                        selectedMov.firma_emisor
                          ? "bg-slate-950/50 border-indigo-500/15"
                          : "bg-slate-950/20 border-slate-700/20"
                      }`}>
                        <div className={`text-[9px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1 ${
                          selectedMov.firma_emisor ? "text-indigo-400" : "text-slate-600"
                        }`}>
                          {selectedMov.firma_emisor && (
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500"></span>
                            </span>
                          )}
                          Paso 2 · Receptor
                        </div>
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(
                            `activos-app://sign-movement?id=${selectedMov.id}&contract=${selectedMov.contrato_uuid ?? ""}&step=receptor`
                          )}`}
                          alt="QR Firma Receptor"
                          className={`w-32 h-32 bg-white p-1.5 rounded-xl shadow-inner border ${
                            selectedMov.firma_emisor ? "border-indigo-500/20" : "border-slate-600/20 grayscale opacity-40"
                          }`}
                        />
                        <p className={`text-[9px] mt-1.5 text-center ${
                          selectedMov.firma_emisor ? "text-indigo-300/60" : "text-slate-600"
                        }`}>
                          {selectedMov.firma_emisor ? selectedMov.lugar_destino_nombre : "Bloqueado — requiere firma emisor"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Info nota */}
              <div className="flex items-start gap-2 text-[11px] text-indigo-300 bg-indigo-500/10 p-3 rounded-2xl border border-indigo-500/20">
                <FiInfo size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                <p>El movimiento se marcará como <strong>Ejecutado</strong> automáticamente cuando ambas firmas estén completas. El activo será trasladado al destino.</p>
              </div>

              <button
                onClick={() => setSelectedMov(null)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
