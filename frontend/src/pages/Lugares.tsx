import { useEffect, useState, useCallback } from "react";
import DataTable from "../components/DataTable";
import { lugarService, tipoLugarService } from "../services";
import type { Lugar } from "../types";
import { AxiosError } from "axios";

export default function Lugares() {
  const [data, setData] = useState<Lugar[]>([]);
  const [tipoLugarOptions, setTipoLugarOptions] = useState<{ id: number; nombre: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<number | string | null>(null);
  const [form, setForm] = useState({ nombre: "", descripcion: "", tipo_lugar_id: "" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [lugares, tipos] = await Promise.all([lugarService.getAll(), tipoLugarService.getAll()]);
      setData(lugares);
      setTipoLugarOptions(tipos);
    } catch { setData([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: number | string) => {
    if (!confirm("¿Eliminar lugar?")) return;
    try { await lugarService.remove(id); setData((prev) => prev.filter((d) => d.id !== id)); }
    catch (err: unknown) { alert(err instanceof AxiosError ? err.response?.data?.message : "Error"); }
  };

  const handleEdit = (id: number | string) => {
    const item = data.find((d) => d.id === id);
    if (item) {
      setForm({ nombre: item.nombre, descripcion: item.descripcion, tipo_lugar_id: String(item.tipo_lugar_id ?? "") });
      setEditId(id);
    }
  };

  const handleSave = async () => {
    if (!form.nombre) return;
    setSaving(true);
    const payload = { ...form, tipo_lugar_id: form.tipo_lugar_id ? Number(form.tipo_lugar_id) : null };
    try {
      if (editId) {
        await lugarService.update(editId, payload);
        setData((prev) => prev.map((d) => d.id === editId ? { ...d, ...payload } : d));
        setEditId(null);
      } else {
        await lugarService.create(payload);
        await load();
      }
      setForm({ nombre: "", descripcion: "", tipo_lugar_id: "" });
    } catch (err: unknown) {
      alert(err instanceof AxiosError ? err.response?.data?.message : "Error");
    } finally { setSaving(false); }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Lugares</h1>
        <p className="text-sm text-slate-500 mt-0.5">Ubicaciones de activos</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Tipo</label>
            <select value={form.tipo_lugar_id} onChange={(e) => setForm({ ...form, tipo_lugar_id: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-white">
              <option value="">Sin tipo</option>
              {tipoLugarOptions.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button onClick={handleSave} disabled={saving || !form.nombre}
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-sm">
              {saving ? "Guardando..." : editId ? "Actualizar" : "Agregar"}
            </button>
            {editId && (
              <button onClick={() => { setEditId(null); setForm({ nombre: "", descripcion: "", tipo_lugar_id: "" }); }}
                className="px-5 py-2.5 rounded-xl text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                Cancelar
              </button>
            )}
          </div>
        </div>
      </div>

      <DataTable<Lugar>
        columns={[
          { key: "id", label: "ID" },
          { key: "nombre", label: "Nombre" },
          { key: "descripcion", label: "Descripción" },
          { key: "tipo_lugar_nombre", label: "Tipo" },
        ]}
        data={data} loading={loading} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
}
