import { useEffect, useState, useCallback } from "react";
import DataTable from "../components/DataTable";
import { tipoService } from "../services";
import type { Tipo } from "../types";
import { AxiosError } from "axios";
import { FiPlus, FiX, FiTag, FiFileText } from "react-icons/fi";

export default function Tipos({ showHeader = true }: { showHeader?: boolean }) {
  const [data, setData] = useState<Tipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | string | null>(null);
  const [form, setForm] = useState({ nombre: "", descripcion: "" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await tipoService.getAll());
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
    if (!confirm("¿Eliminar tipo?")) return;
    try {
      await tipoService.remove(id);
      setData((prev) => prev.filter((d) => d.id !== id));
    } catch (err: unknown) {
      alert(err instanceof AxiosError ? err.response?.data?.message : "Error");
    }
  };

  const openCreateModal = () => {
    setForm({ nombre: "", descripcion: "" });
    setEditId(null);
    setIsModalOpen(true);
  };

  const handleEdit = (id: number | string) => {
    const item = data.find((d) => d.id === id);
    if (item) {
      setForm({ nombre: item.nombre, descripcion: item.descripcion || "" });
      setEditId(id);
      setIsModalOpen(true);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await tipoService.update(editId, form);
      } else {
        await tipoService.create(form);
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
            <h1 className="text-2xl font-bold text-slate-100">Tipos de Activos</h1>
            <p className="text-sm text-slate-450 mt-0.5">Administrar categorías de activos fijos</p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
          >
            <FiPlus size={16} /> Nuevo Tipo
          </button>
        </div>
      ) : (
        <div className="flex justify-end mb-4">
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-600/15 cursor-pointer"
          >
            <FiPlus size={16} /> Nuevo Tipo
          </button>
        </div>
      )}

      <DataTable<Tipo>
        columns={[
          { key: "id", label: "ID" },
          { key: "nombre", label: "Nombre" },
          { key: "descripcion", label: "Descripción" },
        ]}
        data={data}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchPlaceholder="Buscar tipo..."
      />

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300">
          <div className="bg-slate-900 rounded-2xl w-full max-w-md border border-white/5 shadow-2xl overflow-hidden relative transform transition-transform duration-300 scale-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-slate-950/20">
              <h2 className="text-lg font-bold text-slate-100">
                {editId ? "Editar Tipo de Activo" : "Registrar Nuevo Tipo"}
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
                  placeholder="Ej. Computación, Mobiliario, Redes"
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
                  placeholder="Ej. Equipos de computación personales y servidores"
                  className="w-full px-3.5 py-2.5 bg-slate-950/50 border border-white/10 rounded-xl text-sm text-white placeholder-white/20 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
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
                  {saving ? "Guardando..." : editId ? "Guardar Cambios" : "Crear Tipo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
