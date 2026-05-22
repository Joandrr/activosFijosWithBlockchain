import { useEffect, useState } from "react";
import EntityForm from "../components/EntityForm";
import { activoService, tipoService, marcaService, lugarService } from "../services";
import type { SelectOption } from "../types";

export default function ActivoForm() {
  const [tipoOptions, setTipoOptions] = useState<SelectOption[]>([]);
  const [marcaOptions, setMarcaOptions] = useState<SelectOption[]>([]);
  const [lugarOptions, setLugarOptions] = useState<SelectOption[]>([]);

  useEffect(() => {
    tipoService.getAll().then((r) => setTipoOptions(r.map((t) => ({ value: t.id, label: t.nombre }))));
    marcaService.getAll().then((r) => setMarcaOptions(r.map((m) => ({ value: m.id, label: m.nombre }))));
    lugarService.getAll().then((r) => setLugarOptions(r.map((l) => ({ value: l.id, label: l.nombre }))));
  }, []);

  return (
    <EntityForm
      title="Activo"
      backPath="/activos"
      service={activoService}
      fields={[
        { name: "codigo", label: "Código", required: true },
        { name: "nombre", label: "Nombre", required: true },
        { name: "urlImagen", label: "URL Imagen", placeholder: "https://..." },
        { name: "fecha_registro", label: "Fecha Registro", type: "date" },
        { name: "tipo_id", label: "Tipo", type: "select", options: tipoOptions },
        { name: "marca_id", label: "Marca", type: "select", options: marcaOptions },
        { name: "lugar_id", label: "Ubicación", type: "select", options: lugarOptions },
      ]}
    />
  );
}
