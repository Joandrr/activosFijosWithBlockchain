import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../components/DataTable";
import { movimientoService } from "../services";
import type { Movimiento } from "../types";
import { AxiosError } from "axios";

export default function Movimientos() {
  const [data, setData] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const res = await movimientoService.getAll();
      setData(res);
    } catch { setData([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: number | string) => {
    if (!confirm("¿Eliminar movimiento?")) return;
    try {
      await movimientoService.remove(id);
      setData((prev) => prev.filter((d) => d.id !== id));
    } catch (err: unknown) {
      alert(err instanceof AxiosError ? err.response?.data?.message : "Error al eliminar");
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Movimientos</h1>
        <p className="text-sm text-slate-500 mt-0.5">Registro de movimientos de activos</p>
      </div>
      <DataTable<Movimiento>
        columns={[
          { key: "codigo_movimiento", label: "Código" },
          { key: "fecha_movimiento", label: "Fecha" },
          { key: "estado_movimiento_nombre", label: "Estado Mov." },
          { key: "estado_activo_nombre", label: "Estado Activo" },
          { key: "lugar_origen_nombre", label: "Origen" },
          { key: "lugar_destino_nombre", label: "Destino" },
          { key: "usuario_nombre", label: "Usuario" },
        ]}
        data={data}
        loading={loading}
        onEdit={(id) => navigate(`/movimientos/editar/${id}`)}
        onDelete={handleDelete}
        createLink="/movimientos/nuevo"
        createLabel="Nuevo Movimiento"
        searchPlaceholder="Buscar movimiento..."
      />
    </div>
  );
}
