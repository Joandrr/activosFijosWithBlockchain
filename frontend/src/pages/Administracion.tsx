import { useState } from "react";
import { FiMapPin, FiTag, FiGrid, FiSliders, FiMap } from "react-icons/fi";
import Marcas from "./Marcas";
import Lugares from "./Lugares";
import Tipos from "./Tipos";
import DetalleTipo from "./DetalleTipo";
import TiposLugar from "./TiposLugar";

type Tab = "lugares" | "marcas" | "tipos" | "detalles" | "tipos-lugar";

export default function Administracion() {
  const [activeTab, setActiveTab] = useState<Tab>("lugares");

  const tabs = [
    { id: "lugares" as Tab, label: "Lugares", icon: FiMapPin },
    { id: "marcas" as Tab, label: "Marcas", icon: FiTag },
    { id: "tipos" as Tab, label: "Tipos de Activos", icon: FiGrid },
    { id: "detalles" as Tab, label: "Detalles de Tipo", icon: FiSliders },
    { id: "tipos-lugar" as Tab, label: "Tipos de Lugar", icon: FiMap },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-100">Panel de Administración</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Configuración global de activos, ubicaciones, fabricantes y taxonomía del sistema.
        </p>
      </div>

      {/* Tab bar header */}
      <div className="flex border-b border-white/5 mb-6 overflow-x-auto scrollbar-none gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 font-semibold text-sm transition-all duration-200 cursor-pointer whitespace-nowrap ${
                active
                  ? "border-indigo-500 text-indigo-400 bg-indigo-500/5"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab panel content container */}
      <div className="p-1 animate-in fade-in duration-200">
        {activeTab === "lugares" && <Lugares showHeader={false} />}
        {activeTab === "marcas" && <Marcas showHeader={false} />}
        {activeTab === "tipos" && <Tipos showHeader={false} />}
        {activeTab === "detalles" && <DetalleTipo showHeader={false} />}
        {activeTab === "tipos-lugar" && <TiposLugar showHeader={false} />}
      </div>
    </div>
  );
}
