import { useEffect, useState } from "react";
import EntityForm from "../components/EntityForm";
import { movimientoService, estadoMovimientoService, estadoActivoService, lugarService, usuarioService } from "../services";
import type { SelectOption } from "../types";

export default function MovimientoForm() {
  const [estadoMovOptions, setEstadoMovOptions] = useState<SelectOption[]>([]);
  const [estadoActOptions, setEstadoActOptions] = useState<SelectOption[]>([]);
  const [lugarOptions, setLugarOptions] = useState<SelectOption[]>([]);
  const [usuarioOptions, setUsuarioOptions] = useState<SelectOption[]>([]);

  useEffect(() => {
    estadoMovimientoService.getAll().then((r) => setEstadoMovOptions(r.map((x) => ({ value: x.id, label: x.nombre }))));
    estadoActivoService.getAll().then((r) => setEstadoActOptions(r.map((x) => ({ value: x.id, label: x.nombre }))));
    lugarService.getAll().then((r) => setLugarOptions(r.map((x) => ({ value: x.id, label: x.nombre }))));
    usuarioService.getAll().then((r) => setUsuarioOptions(r.map((x) => ({ value: x.id, label: `${x.nombre} ${x.apellido}` }))));
  }, []);

  return (
    <EntityForm
      title="Movimiento"
      backPath="/movimientos"
      service={movimientoService}
      fields={[
        { name: "codigo_movimiento", label: "Código Movimiento", required: true },
        { name: "fecha_movimiento", label: "Fecha", type: "date" },
        { name: "observaciones", label: "Observaciones", type: "textarea" },
        { name: "estado_movimiento_id", label: "Estado Movimiento", type: "select", options: estadoMovOptions },
        { name: "estado_activo_id", label: "Estado Activo", type: "select", options: estadoActOptions },
        { name: "lugar_origen_id", label: "Lugar Origen", type: "select", options: lugarOptions },
        { name: "lugar_destino_id", label: "Lugar Destino", type: "select", options: lugarOptions },
        { name: "usuario_id", label: "Usuario", type: "select", options: usuarioOptions },
      ]}
    />
  );
}
