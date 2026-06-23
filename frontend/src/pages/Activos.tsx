import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DataTable from "../components/DataTable";
import { activoService, movimientoService, signReceptor, tipoService, marcaService, lugarService } from "../services";
import type { Activo, Movimiento, Tipo, Marca, Lugar } from "../types";
import { AxiosError } from "axios";
import { FiX, FiActivity, FiShield, FiUser, FiCalendar, FiClock, FiAlertCircle, FiPlus, FiTag, FiImage, FiSettings, FiGlobe, FiMapPin, FiSearch } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const getFullImageUrl = (url?: string | null) => {
  if (!url) return "";
  
  // If the URL contains an AWS S3 reference, extract the key and use the proxy
  if (url.includes("amazonaws.com") && url.includes("/activos/")) {
    const idx = url.indexOf("/activos/");
    if (idx !== -1) {
      const key = url.substring(idx + 1); // "activos/img-..."
      return `${API_URL}/api/upload/image/${key}`;
    }
  }

  // If it is a proxy URL but pointing to another host (like localhost from database, or old domain),
  // map it to the current API_URL
  if (url.includes("/api/upload/image/")) {
    const idx = url.indexOf("/api/upload/image/");
    if (idx !== -1) {
      const path = url.substring(idx); // "/api/upload/image/activos/img-..."
      return `${API_URL}${path}`;
    }
  }

  // If it's already a relative path starting with /api/upload/image, prepend API_URL
  if (url.startsWith("/api/upload/image/")) {
    return `${API_URL}${url}`;
  }

  // If it's any other relative path, prepend API_URL
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return `${API_URL}${url.startsWith("/") ? "" : "/"}${url}`;
  }

  return url;
};

interface SelectOption {
  value: number;
  label: string;
}

export default function Activos() {
  const { token } = useAuth();
  const [data, setData] = useState<Activo[]>([]);
  const [movements, setMovements] = useState<Movimiento[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Activo | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingMovementId, setSigningMovementId] = useState<number | null>(null);

  // Filters for PDF Report
  const [filterLugar, setFilterLugar] = useState("");
  const [filterEstado, setFilterEstado] = useState("");
  const [filterFechaInicio, setFilterFechaInicio] = useState("");
  const [filterFechaFin, setFilterFechaFin] = useState("");
  const [showDeBaja, setShowDeBaja] = useState(false);

  // Modal form states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [detailAsset, setDetailAsset] = useState<Activo | null>(null);
  const [editId, setEditId] = useState<number | string | null>(null);
  const [form, setForm] = useState({
    codigo: "",
    nombre: "",
    urlImagen: "",
    fecha_registro: new Date().toISOString().split("T")[0],
    tipo_id: "",
    marca_id: "",
    lugar_id: ""
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await api.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (res.data?.data?.url) {
        setForm(prev => ({ ...prev, urlImagen: res.data.data.url }));
      }
    } catch (err) {
      console.error("Error al subir imagen:", err);
      alert("Error al subir la imagen a S3.");
    } finally {
      setUploading(false);
    }
  };

  // Dropdown options
  const [tipoOptions, setTipoOptions] = useState<SelectOption[]>([]);
  const [marcaOptions, setMarcaOptions] = useState<SelectOption[]>([]);
  const [lugarOptions, setLugarOptions] = useState<SelectOption[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const [resActivos, resMovimientos, resTipos, resMarcas, resLugares] = await Promise.all([
        activoService.getAll(),
        movimientoService.getAll(),
        tipoService.getAll(),
        marcaService.getAll(),
        lugarService.getAll()
      ]);
      setData(resActivos);
      setMovements(resMovimientos);
      setTipoOptions(resTipos.map((t: Tipo) => ({ value: t.id, label: t.nombre })));
      setMarcaOptions(resMarcas.map((m: Marca) => ({ value: m.id, label: m.nombre })));
      setLugarOptions(resLugares.map((l: Lugar) => ({ value: l.id, label: l.nombre })));
    } catch {
      setData([]);
      setMovements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // SSE listening
  useEffect(() => {
    if (!token) return;

    const sse = new EventSource(`${API_URL}/api/realtime/stream?token=${token}`);
    
    sse.addEventListener("activo_cambiado", () => {
      console.log("[SSE] Activo cambiado recibido. Recargando listado...");
      load();
    });

    sse.addEventListener("movimiento_cambiado", () => {
      console.log("[SSE] Movimiento cambiado recibido. Recargando listado...");
      load();
    });

    sse.onerror = (err) => {
      console.error("[SSE] Error en conexión en Activos:", err);
    };

    return () => {
      sse.close();
    };
  }, [token]);

  const handleDownloadReport = () => {
    const params = new URLSearchParams();
    if (filterLugar) params.append("lugar_id", filterLugar);
    if (filterEstado) params.append("estado", filterEstado);
    if (filterFechaInicio) params.append("fecha_inicio", filterFechaInicio);
    if (filterFechaFin) params.append("fecha_fin", filterFechaFin);
    params.append("token", token || "");

    window.open(`${API_URL}/api/activos/reporte?${params.toString()}&_cb=${Date.now()}`, "_blank");
  };

  const handleDelete = async (id: number | string) => {
    if (!confirm("¿Dar de baja este activo con firma digital?")) return;
    try {
      await activoService.remove(id);
      load();
    } catch (err: unknown) {
      alert(err instanceof AxiosError ? err.response?.data?.message : "Error al dar de baja");
    }
  };

  const handleSignReceptor = async (movementId: number) => {
    setSigningMovementId(movementId);
    try {
      await signReceptor(movementId);
      await load();
      if (selectedAsset) {
        const updatedAsset = data.find(a => a.id === selectedAsset.id);
        if (updatedAsset) setSelectedAsset(updatedAsset);
      }
    } catch (err: unknown) {
      alert(err instanceof AxiosError ? err.response?.data?.message : "Error al firmar");
    } finally {
      setSigningMovementId(null);
    }
  };

  const openCreateModal = () => {
    setForm({
      codigo: "",
      nombre: "",
      urlImagen: "",
      fecha_registro: new Date().toISOString().split("T")[0],
      tipo_id: "",
      marca_id: "",
      lugar_id: ""
    });
    setEditId(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (id: number | string) => {
    const item = data.find((d) => d.id === id);
    if (item) {
      setForm({
        codigo: item.codigo,
        nombre: item.nombre,
        urlImagen: item.urlImagen || "",
        fecha_registro: item.fecha_registro ? item.fecha_registro.split("T")[0] : new Date().toISOString().split("T")[0],
        tipo_id: item.tipo_id ? String(item.tipo_id) : "",
        marca_id: item.marca_id ? String(item.marca_id) : "",
        lugar_id: item.lugar_id ? String(item.lugar_id) : ""
      });
      setEditId(id);
      setIsFormModalOpen(true);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        tipo_id: form.tipo_id ? Number(form.tipo_id) : undefined,
        marca_id: form.marca_id ? Number(form.marca_id) : undefined,
        lugar_id: form.lugar_id ? Number(form.lugar_id) : undefined
      };

      if (editId) {
        await activoService.update(editId, payload);
      } else {
        await activoService.create(payload);
      }
      setIsFormModalOpen(false);
      load();
    } catch (err: unknown) {
      alert(err instanceof AxiosError ? err.response?.data?.message : "Error al guardar activo");
    } finally {
      setSaving(false);
    }
  };

  const assetMovements = selectedAsset
    ? movements.filter((m) => m.activo_id === selectedAsset.id)
    : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Activos</h1>
          <p className="text-sm text-slate-400 mt-0.5">Gestión e integridad notarial de activos fijos</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-600/15 cursor-pointer"
        >
          <FiPlus size={16} /> Nuevo Activo
        </button>
      </div>

      {/* Barra de Filtros y Reportes */}
      <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-4 flex flex-wrap gap-4 items-end justify-between backdrop-blur-xl mb-6">
        <div className="flex flex-wrap gap-4 flex-1">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-450">Ubicación</span>
            <select
              value={filterLugar}
              onChange={(e) => setFilterLugar(e.target.value)}
              className="bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 min-w-[150px] outline-none"
            >
              <option value="">Todas</option>
              {lugarOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-450">Estado</span>
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 min-w-[120px] outline-none"
            >
              <option value="">Todos</option>
              <option value="true">Disponible</option>
              <option value="false">De Baja</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-450">Fecha Inicio</span>
            <input
              type="date"
              value={filterFechaInicio}
              onChange={(e) => setFilterFechaInicio(e.target.value)}
              className="bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 outline-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-450">Fecha Fin</span>
            <input
              type="date"
              value={filterFechaFin}
              onChange={(e) => setFilterFechaFin(e.target.value)}
              className="bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 outline-none"
            />
          </div>
          <div className="flex items-center h-full pt-6 pl-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showDeBaja}
                onChange={(e) => setShowDeBaja(e.target.checked)}
                className="w-4 h-4 rounded border-white/10 bg-slate-950/60 text-indigo-600 focus:ring-indigo-500/20 outline-none cursor-pointer"
              />
              <span>Mostrar Dados de Baja</span>
            </label>
          </div>
        </div>
        <button
          onClick={handleDownloadReport}
          className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-sm font-semibold transition-all border border-white/10 cursor-pointer"
        >
          Generar PDF Consolidado
        </button>
      </div>

      <DataTable<Activo>
        columns={[
          { key: "codigo", label: "Código" },
          { key: "nombre", label: "Nombre" },
          { key: "tipo_nombre", label: "Tipo" },
          { key: "marca_nombre", label: "Marca" },
          { key: "lugar_nombre", label: "Ubicación" },
          {
            key: "contrato_uuid",
            label: "Sello Digital",
            render: (v, item) => {
              if (item.firma_baja) {
                return (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    <FiAlertCircle size={12} /> Baja Notarizada
                  </span>
                );
              }
              return v ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse-subtle">
                  <FiShield size={12} /> Firmado (Notaría)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-900/40 text-slate-500 border border-white/5">
                  No Notarizado
                </span>
              );
            },
          },
          {
            key: "historial",
            label: "Acciones Ficha",
            render: (_, item) => (
              <div className="flex gap-2">
                <button
                  onClick={() => setDetailAsset(item)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-300 hover:text-indigo-200 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                >
                  <FiSearch size={12} /> Ver Detalle
                </button>
                <button
                  onClick={() => setSelectedAsset(item)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-300 hover:text-indigo-200 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                >
                  <FiActivity size={12} /> Ver Ciclo
                </button>
                <button
                  onClick={() => window.open(`${API_URL}/api/activos/${item.id}/reporte?token=${token}&_cb=${Date.now()}`, "_blank")}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-300 hover:text-indigo-200 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                >
                  Ficha PDF
                </button>
              </div>
            ),
          },
        ]}
        data={data.filter(item => showDeBaja || item.estado !== false)}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchPlaceholder="Buscar activo..."
      />

      {/* FORM MODAL (CREATE / EDIT) */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-opacity duration-300">
          <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl w-full max-w-lg border border-white/10 shadow-2xl overflow-hidden relative transform transition-all text-slate-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <h2 className="text-lg font-bold text-slate-100">
                {editId ? "Editar Activo" : "Registrar Nuevo Activo"}
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
                    <FiTag className="text-indigo-400" /> Código *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.codigo}
                    onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                    placeholder="Ej. ACT-001"
                    className="w-full px-3.5 py-2.5 bg-slate-950/40 border border-white/10 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-350 mb-1.5 flex items-center gap-1.5">
                    <FiSettings className="text-indigo-400" /> Nombre *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    placeholder="Ej. Laptop ThinkPad G14"
                    className="w-full px-3.5 py-2.5 bg-slate-950/40 border border-white/10 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-350 mb-1.5 flex items-center gap-1.5">
                  <FiImage className="text-indigo-400" /> Imagen del Activo
                </label>
                <div className="flex flex-col gap-3">
                  {!form.urlImagen ? (
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:bg-white/5 transition-all">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <FiImage className="w-8 h-8 text-slate-500 mb-2" />
                          <p className="text-sm text-slate-400">
                            {uploading ? "Subiendo a AWS S3..." : "Selecciona una imagen (.png, .jpg)"}
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploading}
                          onChange={handleImageUpload}
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-white/10 group">
                      <img src={getFullImageUrl(form.urlImagen)} alt="Vista previa del activo" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, urlImagen: "" })}
                        className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-400 font-bold text-xs transition-opacity cursor-pointer"
                      >
                        Eliminar Imagen
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-350 mb-1.5 flex items-center gap-1.5">
                  <FiCalendar className="text-indigo-400" /> Fecha de Registro *
                </label>
                <input
                  type="date"
                  required
                  value={form.fecha_registro}
                  onChange={(e) => setForm({ ...form, fecha_registro: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950/40 border border-white/10 rounded-xl text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all [color-scheme:dark]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-350 mb-1.5 flex items-center gap-1.5">
                    <FiTag className="text-indigo-400" /> Tipo
                  </label>
                  <select
                    value={form.tipo_id}
                    onChange={(e) => setForm({ ...form, tipo_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  >
                    <option value="" className="bg-slate-950 text-slate-300">Seleccionar...</option>
                    {tipoOptions.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-slate-950 text-slate-200">{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-350 mb-1.5 flex items-center gap-1.5">
                    <FiGlobe className="text-indigo-400" /> Marca
                  </label>
                  <select
                    value={form.marca_id}
                    onChange={(e) => setForm({ ...form, marca_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  >
                    <option value="" className="bg-slate-950 text-slate-300">Seleccionar...</option>
                    {marcaOptions.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-slate-950 text-slate-200">{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-350 mb-1.5 flex items-center gap-1.5">
                    <FiMapPin className="text-indigo-400" /> Ubicación
                  </label>
                  <select
                    value={form.lugar_id}
                    onChange={(e) => setForm({ ...form, lugar_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  >
                    <option value="" className="bg-slate-950 text-slate-300">Seleccionar...</option>
                    {lugarOptions.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-slate-950 text-slate-200">{opt.label}</option>
                    ))}
                  </select>
                </div>
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
                  {saving ? "Guardando..." : editId ? "Guardar Cambios" : "Crear Activo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL DEL TIMELINE DE CICLO DE VIDA (PREMIUM DESIGN) */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/10 text-slate-100 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-slate-950 to-indigo-950/80 text-white flex items-center justify-between border-b border-white/5">
              <div>
                <h3 className="font-bold text-lg text-slate-100">{selectedAsset.nombre}</h3>
                <p className="text-xs text-slate-400 mt-1">Código: <span className="text-indigo-300 font-mono">{selectedAsset.codigo}</span></p>
              </div>
              <button
                onClick={() => setSelectedAsset(null)}
                className="p-1.5 rounded-full bg-white/5 text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Modal Body / Timeline */}
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
              <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-2">Historial de Notarización</h4>

              <div className="relative border-l border-white/10 ml-4 pl-6 space-y-6">
                
                {/* HIT 1: CREACIÓN */}
                <div className="relative">
                  <span className="absolute -left-[31px] top-0.5 flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white ring-8 ring-slate-900">
                    <FiShield size={10} />
                  </span>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h5 className="font-bold text-slate-250 text-sm">Registro del Activo</h5>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">Verificado</span>
                    </div>
                    <p className="text-xs text-slate-350">El activo ha sido registrado e ingresado al inventario general.</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-slate-400 text-[11px]">
                      <span className="flex items-center gap-1"><FiUser size={12} /> Por: Administrador</span>
                      <span className="flex items-center gap-1"><FiCalendar size={12} /> {selectedAsset.fecha_registro}</span>
                    </div>
                    {selectedAsset.contrato_uuid && (
                      <div className="mt-2 p-3 bg-slate-950/50 rounded-xl border border-white/5 text-[10px] font-mono text-indigo-400 break-all">
                        <strong>ID Contrato (DynamoDB):</strong>{" "}
                        <Link
                          to={`/validador?id=${selectedAsset.contrato_uuid}`}
                          className="text-indigo-400 hover:text-indigo-300 hover:underline font-semibold transition-all"
                        >
                          {selectedAsset.contrato_uuid} (Auditar Registro)
                        </Link>
                        <br />
                        <strong className="text-slate-400">Firma Criptográfica:</strong> <span className="text-slate-300">{selectedAsset.firma_creacion?.substring(0, 40)}...</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* HIT 2: MOVIMIENTOS */}
                {assetMovements.map((mov, index) => {
                  const isCompleted = mov.estado_movimiento_id === 2; // In db seed.sql, 2 is 'Ejecutado' (completed)
                  return (
                    <div key={mov.id} className="relative">
                      <span className={`absolute -left-[31px] top-0.5 flex items-center justify-center w-5 h-5 rounded-full text-white ring-8 ring-slate-900 ${isCompleted ? "bg-indigo-600" : "bg-amber-500 animate-pulse"}`}>
                        <FiClock size={10} />
                      </span>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-slate-250 text-sm">Transferencia #{index + 1} ({mov.codigo_movimiento})</h5>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${isCompleted ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20" : "bg-amber-500/10 text-amber-300 border border-amber-500/20"}`}>
                            {isCompleted ? "Completado" : "Pendiente Receptor"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-350">
                          Movimiento de <strong className="text-slate-200">{mov.lugar_origen_nombre || "Origen Desconocido"}</strong> a <strong className="text-slate-200">{mov.lugar_destino_nombre || "Destino Desconocido"}</strong>.
                        </p>
                        <p className="text-xs text-slate-450 italic">"{mov.observaciones || "Sin observaciones"}"</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-slate-455 text-[11px]">
                          <span className="flex items-center gap-1"><FiUser size={12} /> Emisor: Auxiliar</span>
                          <span className="flex items-center gap-1"><FiCalendar size={12} /> {mov.fecha_movimiento}</span>
                        </div>

                        {/* Detalle de Firmas Criptográficas */}
                        <div className="mt-2 p-3 bg-slate-950/50 rounded-xl border border-white/5 space-y-1 text-[10px] font-mono">
                          <p className="text-slate-400">✍️ Firma Emisor: <span className="text-emerald-450 font-semibold">{mov.firma_emisor ? "Verificada" : "Falta"}</span></p>
                          <p className="text-slate-400">
                            ✍️ Firma Receptor:{" "}
                            {mov.firma_receptor ? (
                              <span className="text-emerald-455 font-semibold">Verificada</span>
                            ) : (
                              <span className="text-amber-450 font-semibold animate-pulse">Pendiente de Firma Embozada</span>
                            )}
                          </p>
                          {mov.contrato_uuid && (
                            <p className="text-indigo-400 break-all mt-1">
                              <strong>ID Contrato:</strong>{" "}
                              <Link
                                to={`/validador?id=${mov.contrato_uuid}`}
                                className="text-indigo-400 hover:text-indigo-300 hover:underline font-semibold transition-all"
                              >
                                {mov.contrato_uuid} (Auditar Traslado)
                              </Link>
                            </p>
                          )}
                        </div>

                        {/* Simulación de Firma del Receptor Web si está pendiente */}
                        {!isCompleted && (
                          <div className="mt-2 p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 flex items-center justify-between gap-3">
                            <div className="text-[11px] text-amber-300">
                              <p className="font-bold">Espera Firma de Recepción</p>
                              <p className="text-amber-400/80">El responsable en {mov.lugar_destino_nombre} debe firmar para autorizar la recepción.</p>
                            </div>
                            <button
                              onClick={() => handleSignReceptor(mov.id)}
                              disabled={signingMovementId === mov.id}
                              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-[11px] font-bold transition-all shadow-md shadow-amber-650/15 disabled:opacity-50 cursor-pointer"
                            >
                              {signingMovementId === mov.id ? "Firmando..." : "Firmar Receptor"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* HIT 3: BAJA */}
                {selectedAsset.firma_baja && (
                  <div className="relative">
                    <span className="absolute -left-[31px] top-0.5 flex items-center justify-center w-5 h-5 rounded-full bg-rose-500 text-white ring-8 ring-slate-900">
                      <FiAlertCircle size={10} />
                    </span>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h5 className="font-bold text-slate-250 text-sm">Baja del Activo</h5>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-500/10 text-rose-455 border border-rose-500/20 uppercase tracking-wider">Desincorporado</span>
                      </div>
                      <p className="text-xs text-slate-350">El activo ha sido dado de baja definitivamente del inventario.</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-slate-400 text-[11px]">
                        <span className="flex items-center gap-1"><FiUser size={12} /> Por: Administrador</span>
                      </div>
                      <div className="mt-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[10px] font-mono text-rose-300 break-all space-y-1">
                        <p><strong>Certificado de Baja (Notaría):</strong> {selectedAsset.firma_baja}</p>
                        {selectedAsset.contrato_uuid && (
                          <p>
                            <strong>ID Contrato:</strong>{" "}
                            <Link
                              to={`/validador?id=${selectedAsset.contrato_uuid}`}
                              className="text-rose-400 hover:text-rose-300 hover:underline font-semibold transition-all"
                            >
                              {selectedAsset.contrato_uuid} (Auditar Baja)
                            </Link>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-950/30 border-t border-white/5 flex justify-between items-center">
              <button
                onClick={() => window.open(`${API_URL}/api/activos/${selectedAsset.id}/reporte?token=${token}&_cb=${Date.now()}`, "_blank")}
                className="px-4 py-2 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 rounded-xl text-sm font-semibold text-indigo-400 transition-colors shadow-sm cursor-pointer"
              >
                Descargar Ficha PDF
              </button>
              <button
                onClick={() => setSelectedAsset(null)}
                className="px-4 py-2 bg-slate-900 border border-white/10 hover:bg-white/5 rounded-xl text-sm font-semibold text-slate-300 transition-colors shadow-sm cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE DETALLE DEL ACTIVO (PREMIUM DESIGN) */}
      {detailAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/10 text-slate-100 animate-in fade-in zoom-in-95 duration-150 my-auto">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-slate-950 to-indigo-950/80 text-white flex items-center justify-between border-b border-white/5">
              <div>
                <h3 className="font-bold text-lg text-slate-100">Detalles del Activo</h3>
                <p className="text-xs text-slate-400 mt-1">Código: <span className="text-indigo-300 font-mono">{detailAsset.codigo}</span></p>
              </div>
              <button
                onClick={() => setDetailAsset(null)}
                className="p-1.5 rounded-full bg-white/5 text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Columna Izquierda: Imagen */}
                <div className="flex flex-col space-y-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Imagen del Activo</span>
                  <div className="flex items-center justify-center bg-slate-950/40 rounded-2xl overflow-hidden border border-white/10 h-56 w-full shadow-inner relative group">
                    {detailAsset.urlImagen ? (
                      <img
                        src={getFullImageUrl(detailAsset.urlImagen)}
                        alt={detailAsset.nombre}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex flex-col items-center text-slate-500">
                        <FiImage size={40} className="text-slate-500 mb-2" />
                        <span className="text-xs">Sin imagen</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Columna Derecha: Atributos en una cuadrícula compacta */}
                <div className="flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-455 uppercase tracking-wider block">Nombre del Activo</span>
                      <span className="font-bold text-slate-250 text-base">{detailAsset.nombre}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/20 p-4 rounded-xl border border-white/5">
                      <div>
                        <span className="text-[9px] font-semibold text-slate-455 uppercase tracking-wider block">Categoría</span>
                        <span className="font-bold text-slate-200">{detailAsset.tipo_nombre || "No especificado"}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-semibold text-slate-455 uppercase tracking-wider block">Marca</span>
                        <span className="font-bold text-slate-200">{detailAsset.marca_nombre || "No especificado"}</span>
                      </div>
                      <div className="col-span-2 pt-1.5 border-t border-white/5">
                        <span className="text-[9px] font-semibold text-slate-455 uppercase tracking-wider block">Ubicación Actual</span>
                        <span className="font-bold text-slate-200">{detailAsset.lugar_nombre || "No especificado"}</span>
                      </div>
                      <div className="pt-1.5 border-t border-white/5">
                        <span className="text-[9px] font-semibold text-slate-455 uppercase tracking-wider block">Fecha Registro</span>
                        <span className="font-mono font-semibold text-slate-300">{detailAsset.fecha_registro}</span>
                      </div>
                      <div className="pt-1.5 border-t border-white/5">
                        <span className="text-[9px] font-semibold text-slate-455 uppercase tracking-wider block">Disponibilidad</span>
                        <span className={`font-bold ${detailAsset.estado ? "text-emerald-400" : "text-rose-400"}`}>
                          {detailAsset.estado ? "DISPONIBLE" : "DADO DE BAJA"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-950/30 border-t border-white/5 flex justify-end items-center">
              <button
                onClick={() => setDetailAsset(null)}
                className="px-5 py-2.5 bg-slate-900 border border-white/10 hover:bg-white/5 rounded-xl text-sm font-semibold text-slate-300 transition-colors shadow-sm cursor-pointer"
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
