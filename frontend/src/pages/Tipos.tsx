import { useEffect, useState, useCallback } from "react";
import DataTable from "../components/DataTable";
import { tipoService } from "../services";
import type { Tipo } from "../types";
import { AxiosError } from "axios";

export default function Tipos() {
  const [data, setData] = useState<Tipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<number | string | null>(null);
  const [form, setForm] = useState({ nombre: "", descripcion: "" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setData(await tipoService.getAll()); } catch { setData([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: number | string) => {
    if (!confirm("¿Eliminar tipo?")) return;
    try { await tipoService.remove(id); setData((prev) => prev.filter((d) => d.id !== id)); }
    catch (err: unknown) { alert(err instanceof AxiosError ? err.response?.data?.message : "Error"); }
  };

  const handleEdit = (id: number | string) => {
    const item = data.find((d) => d.id === id);
    if (item) { setForm({ nombre: item.nombre, descripcion: item.descripcion }); setEditId(id); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editId) {
        await tipoService.update(editId, form);
        setData((prev) => prev.map((d) => d.id === editId ? { ...d, ...form } : d));
        setEditId(null);
      } else {
        await tipoService.create(form);
        await load();
      }
      setForm({ nombre: "", descripcion: "" });
    } catch (err: unknown) {
      alert(err instanceof AxiosError ? err.response?.data?.message : "Error al guardar");
    } finally { setSaving(false); }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Tipos</h1>
        <p className="text-sm text-slate-500 mt-0.5">Categorías de activos</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre *</label>
            <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Descripción</label>
            <input value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
          </div>
          <div className="flex items-end gap-2">
            <button onClick={handleSave} disabled={saving || !form.nombre}
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-sm">
              {saving ? "Guardando..." : editId ? "Actualizar" : "Agregar"}
            </button>
            {editId && (
              <button onClick={() => { setEditId(null); setForm({ nombre: "", descripcion: "" }); }}
                className="px-5 py-2.5 rounded-xl text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                Cancelar
              </button>
            )}
          </div>
        </div>
      </div>

      <DataTable<Tipo>
        columns={[
          { key: "id", label: "ID" },
          { key: "nombre", label: "Nombre" },
          { key: "descripcion", label: "Descripción" },
        ]}
        data={data} loading={loading} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
}
