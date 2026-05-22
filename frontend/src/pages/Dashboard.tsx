import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { activoService, movimientoService, usuarioService, lugarService } from "../services";

interface Stat {
  label: string;
  value: number;
  icon: string;
  to: string;
  gradient: string;
  light: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stat[]>([
    { label: "Activos", value: 0, icon: "package", to: "/activos", gradient: "from-indigo-500 to-blue-600", light: "bg-indigo-50" },
    { label: "Movimientos", value: 0, icon: "transfer", to: "/movimientos", gradient: "from-emerald-500 to-teal-600", light: "bg-emerald-50" },
    { label: "Usuarios", value: 0, icon: "users", to: "/usuarios", gradient: "from-violet-500 to-purple-600", light: "bg-violet-50" },
    { label: "Lugares", value: 0, icon: "map-pin", to: "/lugares", gradient: "from-amber-500 to-orange-600", light: "bg-amber-50" },
  ]);

  useEffect(() => {
    Promise.all([
      activoService.getAll(),
      movimientoService.getAll(),
      usuarioService.getAll(),
      lugarService.getAll(),
    ]).then(([a, m, u, l]) => {
      setStats((prev) => prev.map((s, i) => ({ ...s, value: [a.length, m.length, u.length, l.length][i] || 0 })));
    });
  }, []);

  const quickLinks = [
    { label: "Nuevo Activo", to: "/activos/nuevo", desc: "Registrar un activo fijo" },
    { label: "Nuevo Movimiento", to: "/movimientos/nuevo", desc: "Registrar movimiento" },
    { label: "Ver Usuarios", to: "/usuarios", desc: "Administrar usuarios" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Resumen general del sistema</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map(({ label, value, to, gradient }) => (
          <Link
            key={to}
            to={to}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-5 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 group`}
          >
            <p className="text-4xl font-bold">{value}</p>
            <p className="text-sm text-white/80 mt-1">{label}</p>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/5 rounded-full group-hover:scale-110 transition-transform" />
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {quickLinks.map(({ label, to, desc }) => (
          <Link
            key={to}
            to={to}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group"
          >
            <h3 className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">{label}</h3>
            <p className="text-sm text-slate-500 mt-1">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
