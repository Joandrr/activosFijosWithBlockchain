import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../components/DataTable";
import { activoService } from "../services";
import type { Activo } from "../types";
import { AxiosError } from "axios";

export default function Activos() {
  const [data, setData] = useState<Activo[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const res = await activoService.getAll();
      setData(res);
    } catch { setData([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: number | string) => {
    if (!confirm("¿Eliminar activo?")) return;
    try {
      await activoService.remove(id);
      setData((prev) => prev.filter((d) => d.id !== id));
    } catch (err: unknown) {
      alert(err instanceof AxiosError ? err.response?.data?.message : "Error al eliminar");
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Activos</h1>
        <p className="text-sm text-slate-500 mt-0.5">Gestión de activos fijos</p>
      </div>
      <DataTable<Activo>
        columns={[
          { key: "codigo", label: "Código" },
          { key: "nombre", label: "Nombre" },
          { key: "tipo_nombre", label: "Tipo" },
          { key: "marca_nombre", label: "Marca" },
          { key: "lugar_nombre", label: "Ubicación" },
          { key: "estado", label: "Activo", render: (v) => v ? <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">Sí</span> : <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">No</span> },
        ]}
        data={data}
        loading={loading}
        onEdit={(id) => navigate(`/activos/editar/${id}`)}
        onDelete={handleDelete}
        createLink="/activos/nuevo"
        createLabel="Nuevo Activo"
        searchPlaceholder="Buscar activo..."
      />
    </div>
  );
}
