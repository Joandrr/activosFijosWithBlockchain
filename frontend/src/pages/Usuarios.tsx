import { useEffect, useState, useCallback } from "react";
import DataTable from "../components/DataTable";
import { usuarioService } from "../services";
import type { Usuario } from "../types";
import { useAuth } from "../context/AuthContext";
import { AxiosError } from "axios";

export default function Usuarios() {
  const [data, setData] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const usuarios = await usuarioService.getAll();
      setData(usuarios);
    } catch { setData([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: number | string) => {
    if (!confirm("¿Eliminar usuario?")) return;
    try { await usuarioService.remove(id); setData((prev) => prev.filter((d) => d.id !== id)); }
    catch (err: unknown) { alert(err instanceof AxiosError ? err.response?.data?.message : "Error"); }
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
        onDelete={user?.rol_id === 1 ? handleDelete : undefined}
        searchPlaceholder="Buscar usuario..." />
    </div>
  );
}
