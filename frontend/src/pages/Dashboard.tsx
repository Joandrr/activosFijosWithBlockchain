import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { activoService, movimientoService, usuarioService, lugarService } from "../services";
import type { Activo, Movimiento } from "../types";
import { FiArrowRight, FiShield, FiPackage, FiActivity, FiUsers, FiLayers } from "react-icons/fi";

interface Stat {
  label: string;
  value: number;
  icon: any;
  to: string;
  gradient: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stat[]>([
    { label: "Activos Totales", value: 0, icon: FiPackage, to: "/activos", gradient: "from-indigo-650 to-indigo-800" },
    { label: "Movimientos Totales", value: 0, icon: FiActivity, to: "/movimientos", gradient: "from-emerald-600 to-emerald-800" },
    { label: "Usuarios", value: 0, icon: FiUsers, to: "/usuarios", gradient: "from-purple-600 to-purple-800" },
    { label: "Lugares / Aulas", value: 0, icon: FiLayers, to: "/administracion", gradient: "from-amber-600 to-amber-800" },
  ]);

  const [notaryStats, setNotaryStats] = useState({
    signedAssets: 0,
    totalAssets: 0,
    notarizedMovements: 0,
    pendingMovements: 0,
    integrityPercentage: 100,
  });

  useEffect(() => {
    Promise.all([
      activoService.getAll(),
      movimientoService.getAll(),
      usuarioService.getAll(),
      lugarService.getAll(),
    ]).then(([a, m, u, l]) => {
      setStats((prev) =>
        prev.map((s, i) => ({
          ...s,
          value: [a.length, m.length, u.length, l.length][i] || 0,
        }))
      );

      const signedA = a.filter((item: Activo) => !!item.contrato_uuid).length;
      const notarizedM = m.filter((item: Movimiento) => !!item.contrato_uuid).length;
      const pendingM = m.filter((item: Movimiento) => item.estado_movimiento_id === 1).length;
      const totalA = a.length;
      const integrity = totalA > 0 ? Math.round((signedA / totalA) * 100) : 100;

      setNotaryStats({
        signedAssets: signedA,
        totalAssets: totalA,
        notarizedMovements: notarizedM,
        pendingMovements: pendingM,
        integrityPercentage: integrity,
      });
    });
  }, []);

  const quickLinks = [
    { label: "Gestión de Activos", to: "/activos", desc: "Consultar inventario general, ver ciclo de vida y emitir bajas de activos fijos.", icon: FiPackage },
    { label: "Traslado de Activos", to: "/movimientos", desc: "Registrar transferencias de inventario con doble firma criptográfica QR.", icon: FiActivity },
    { label: "Validador Notarial", to: "/validador", desc: "Consultar directamente el Ledger inmutable en DynamoDB Local (Notaría Go).", icon: FiShield },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Dashboard General</h1>
        <p className="text-sm text-slate-400 mt-1">Control de inventario y estado criptográfico del sistema</p>
      </div>

      {/* Banner de Integridad Notarial (Premium Look) */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900/60 backdrop-blur-xl p-6 text-white shadow-2xl border border-white/5">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-44 h-44 bg-teal-500/10 rounded-full blur-2xl" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold tracking-wider text-emerald-400 uppercase">Notaría Digital Activa</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold">Estado de Integridad de Firmas</h2>
            <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
              Cada activo registrado y movimiento de inventario es sellado con criptografía asimétrica RSA y guardado de forma inmutable en DynamoDB Local a través de Go.
            </p>
          </div>

          <div className="flex items-center gap-6 bg-slate-950/60 backdrop-blur-md border border-white/5 p-4.5 rounded-2xl">
            <div className="text-center">
              <p className="text-3xl font-extrabold text-emerald-400">{notaryStats.integrityPercentage}%</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-1 font-semibold">Integridad</p>
            </div>
            <div className="h-10 w-px bg-white/5" />
            <div className="space-y-1 text-xs text-slate-355 font-medium">
              <p>🛡️ Activos Firmados: <strong className="text-white">{notaryStats.signedAssets}</strong> / {notaryStats.totalAssets}</p>
              <p>⛓️ Contratos Notarizados: <strong className="text-white">{notaryStats.notarizedMovements}</strong></p>
              {notaryStats.pendingMovements > 0 && (
                <p className="text-amber-400 animate-pulse">⏳ En Tránsito (Pendiente): <strong>{notaryStats.pendingMovements}</strong></p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Estadísticas Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map(({ label, value, to, gradient, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-5 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 group border border-white/5`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-4xl font-extrabold tracking-tight">{value}</p>
                <p className="text-sm text-white/80 font-medium mt-1">{label}</p>
              </div>
              <div className="p-2 rounded-xl bg-white/10 border border-white/5 text-white/90">
                <Icon size={20} />
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white/5 rounded-full group-hover:scale-110 transition-transform" />
          </Link>
        ))}
      </div>

      {/* Enlaces Rápidos / Accesos Directos */}
      <div>
        <h3 className="text-lg font-bold text-slate-200 mb-4">Operaciones del Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {quickLinks.map(({ label, to, desc, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="bg-slate-900/40 backdrop-blur-xl border border-white/5 p-5 rounded-2xl shadow-xl hover:bg-slate-900/60 hover:border-indigo-500/30 transition-all duration-200 group flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-all">
                  <Icon size={18} />
                </div>
                <h4 className="font-bold text-slate-250 text-base group-hover:text-indigo-400 transition-colors">{label}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-400 mt-4 group-hover:translate-x-1 transition-transform">
                Acceder <FiArrowRight size={12} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
