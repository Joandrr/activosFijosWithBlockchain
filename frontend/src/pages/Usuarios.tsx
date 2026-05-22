import { useEffect, useState, useCallback } from "react";
import DataTable from "../components/DataTable";
import { usuarioService, rolService } from "../services";
import type { Usuario } from "../types";
import { useAuth } from "../context/AuthContext";
import { AxiosError } from "axios";

export default function Usuarios() {
  const [data, setData] = useState<Usuario[]>([]);
  const [rolOptions, setRolOptions] = useState<{ id: number; nombre: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [editId, setEditId] = useState<number | string | null>(null);
  const [form, setForm] = useState({ nombre: "", apellido: "", email: "", genero: "M", estado: true, rol_id: "" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [usuarios, roles] = await Promise.all([usuarioService.getAll(), rolService.getAll()]);
      setData(usuarios);
      setRolOptions(roles);
    } catch { setData([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: number | string) => {
    if (!confirm("¿Eliminar usuario?")) return;
    try { await usuarioService.remove(id); setData((prev) => prev.filter((d) => d.id !== id)); }
    catch (err: unknown) { alert(err instanceof AxiosError ? err.response?.data?.message : "Error"); }
  };

  const handleEdit = (id: number | string) => {
    const item = data.find((d) => d.id === id);
    if (item) {
      setForm({ nombre: item.nombre, apellido: item.apellido, email: item.email, genero: item.genero, estado: item.estado, rol_id: String(item.rol_id ?? "") });
      setEditId(id);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = { ...form, rol_id: form.rol_id ? Number(form.rol_id) : null };
    try {
      if (editId) {
        await usuarioService.update(editId, payload);
        setData((prev) => prev.map((d) => d.id === editId ? { ...d, ...payload } : d));
        setEditId(null);
      }
      setForm({ nombre: "", apellido: "", email: "", genero: "M", estado: true, rol_id: "" });
    } catch (err: unknown) {
      alert(err instanceof AxiosError ? err.response?.data?.message : "Error");
    } finally { setSaving(false); }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Usuarios</h1>
        <p className="text-sm text-slate-500 mt-0.5">Gestión de usuarios del sistema</p>
      </div>
      <DataTable<Usuario>
        columns={[
          { key: "id", label: "ID" },
          { key: "nombre", label: "Nombre" },
          { key: "apellido", label: "Apellido" },
          { key: "email", label: "Email" },
          { key: "rol_nombre", label: "Rol" },
          { key: "estado", label: "Activo", render: (v) => v ? <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">Sí</span> : <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">No</span> },
        ]}
        data={data} loading={loading}
        onEdit={handleEdit}
        onDelete={user?.rol_id === 1 ? handleDelete : undefined}
        searchPlaceholder="Buscar usuario..." />
    </div>
  );
}
