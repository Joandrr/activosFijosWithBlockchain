import { useEffect, useState, useCallback } from "react";
import DataTable from "../components/DataTable";
import { detalleTipoService, tipoService } from "../services";
import type { DetalleTipo } from "../types";
import { AxiosError } from "axios";
import { FiPlus, FiX, FiTag, FiFileText, FiSliders } from "react-icons/fi";

export default function DetalleTipo({ showHeader = true }: { showHeader?: boolean }) {
  const [data, setData] = useState<DetalleTipo[]>([]);
  const [tipoOptions, setTipoOptions] = useState<{ id: number; nombre: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | string | null>(null);
  const [form, setForm] = useState({ nombre: "", descripcion: "", estado: true, tipo_id: "" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [detalles, tipos] = await Promise.all([detalleTipoService.getAll(), tipoService.getAll()]);
      setData(detalles);
      setTipoOptions(tipos);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: number | string) => {
    if (!confirm("¿Eliminar detalle?")) return;
    try {
      await detalleTipoService.remove(id);
      setData((prev) => prev.filter((d) => d.id !== id));
    } catch (err: unknown) {
      alert(err instanceof AxiosError ? err.response?.data?.message : "Error");
    }
  };

  const openCreateModal = () => {
    setForm({ nombre: "", descripcion: "", estado: true, tipo_id: "" });
    setEditId(null);
    setIsModalOpen(true);
  };

  const handleEdit = (id: number | string) => {
    const item = data.find((d) => d.id === id);
    if (item) {
      setForm({
        nombre: item.nombre,
        descripcion: item.descripcion,
        estado: item.estado,
        tipo_id: String(item.tipo_id ?? "")
      });
      setEditId(id);
      setIsModalOpen(true);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      tipo_id: form.tipo_id ? Number(form.tipo_id) : null
    };
    try {
      if (editId) {
        await detalleTipoService.update(editId, payload);
      } else {
        await detalleTipoService.create(payload);
      }
      setIsModalOpen(false);
      load();
    } catch (err: unknown) {
      alert(err instanceof AxiosError ? err.response?.data?.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {showHeader ? (
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Detalles de Tipo</h1>
            <p className="text-sm text-slate-450 mt-0.5">Administrar especificaciones técnicas o atributos por tipo de activo</p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
          >
            <FiPlus size={16} /> Nuevo Detalle
          </button>
        </div>
      ) : (
        <div className="flex justify-end mb-4">
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-600/15 cursor-pointer"
          >
            <FiPlus size={16} /> Nuevo Detalle
          </button>
        </div>
      )}

      <DataTable<DetalleTipo>
        columns={[
          { key: "id", label: "ID" },
          { key: "nombre", label: "Nombre" },
          { key: "descripcion", label: "Descripción" },
          { key: "tipo_nombre", label: "Tipo" },
          {
            key: "estado",
            label: "Activo",
            render: (v) =>
              v ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">Sí</span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">No</span>
              ),
          },
        ]}
        data={data}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchPlaceholder="Buscar detalle de tipo..."
      />

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300">
          <div className="bg-slate-900 rounded-2xl w-full max-w-md border border-white/5 shadow-2xl overflow-hidden relative transform transition-transform duration-300 scale-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-slate-950/20">
              <h2 className="text-lg font-bold text-slate-100">
                {editId ? "Editar Detalle de Tipo" : "Registrar Nuevo Detalle"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <FiTag className="text-indigo-400" /> Nombre *
                </label>
                <input
                  type="text"
                  required
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Ej. Memoria RAM, Almacenamiento SSD"
                  className="w-full px-3.5 py-2.5 bg-slate-950/50 border border-white/10 rounded-xl text-sm text-white placeholder-white/20 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <FiFileText className="text-indigo-400" /> Descripción
                </label>
                <input
                  type="text"
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  placeholder="Ej. Capacidad del módulo en gigabytes"
                  className="w-full px-3.5 py-2.5 bg-slate-950/50 border border-white/10 rounded-xl text-sm text-white placeholder-white/20 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <FiSliders className="text-indigo-400" /> Tipo de Activo
                </label>
                <select
                  value={form.tipo_id}
                  onChange={(e) => setForm({ ...form, tipo_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950/50 border border-white/10 rounded-xl text-sm text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-slate-900 transition-all"
                >
                  <option value="">Seleccionar...</option>
                  {tipoOptions.map((t) => (
                    <option key={t.id} value={t.id} className="bg-slate-900">{t.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="estado"
                  checked={form.estado}
                  onChange={(e) => setForm({ ...form, estado: e.target.checked })}
                  className="h-4.5 w-4.5 rounded border-white/10 text-indigo-650 focus:ring-indigo-500/20"
                />
                <label htmlFor="estado" className="text-sm font-medium text-slate-300 cursor-pointer">
                  Habilitado (Disponible para asignación)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4.5 py-2.5 rounded-xl border border-white/10 text-slate-300 text-sm font-medium hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4.5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer shadow-md shadow-indigo-600/10"
                >
                  {saving ? "Guardando..." : editId ? "Guardar Cambios" : "Crear Detalle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
