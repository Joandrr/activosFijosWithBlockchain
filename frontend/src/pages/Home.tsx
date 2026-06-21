import { Link, useNavigate } from "react-router-dom";
import { FiShield, FiCpu, FiCheckCircle, FiArrowRight, FiUsers } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

export default function Home() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme") || "dark";
    if (saved === "light") {
      document.body.classList.add("light-theme");
    } else {
      document.body.classList.remove("light-theme");
    }
    return saved;
  });

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "light") {
      document.body.classList.add("light-theme");
    } else {
      document.body.classList.remove("light-theme");
    }
  };

  useEffect(() => {
    // If already logged in, let the user navigate directly to dashboard if they want
    // but keep landing page accessible
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-emerald-500/5 rounded-full blur-[150px] rotate-12 pointer-events-none" />

      {/* Navigation Bar */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-white/5 backdrop-blur-md bg-slate-950/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
            AF
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Activos FICCT
          </span>
        </div>
        <div className="flex items-center gap-4">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer mr-1"
            title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            {theme === "dark" ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          <Link
            to="/manual"
            className="px-5 py-2 rounded-xl text-slate-300 font-medium text-sm hover:text-white transition-colors"
          >
            Manual de Usuario
          </Link>
          {token ? (
            <button
              onClick={() => navigate("/dashboard")}
              className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 cursor-pointer"
            >
              Ir al Dashboard
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="px-5 py-2 rounded-xl text-slate-300 font-medium text-sm hover:text-white transition-colors"
              >
                Iniciar Sesión
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-8 animate-fade-in">
          <FiShield className="w-4 h-4" /> Notarización Criptográfica & Ledger en Tiempo Real
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 max-w-4xl mx-auto leading-tight">
          Control total y transparencia para tus{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
            Activos Fijos
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
          Un software corporativo de vanguardia que integra una base de datos relacional PostgreSQL con un ledger de notaría inmutable en DynamoDB mediante firma criptográfica dual.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          {token ? (
            <>
              <button
                onClick={() => navigate("/dashboard")}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-base hover:from-indigo-500 hover:to-purple-500 transition-all shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer group"
              >
                Entrar al Dashboard
                <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <Link
                to="/manual"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-350 font-semibold text-base border border-white/10 transition-all flex items-center justify-center gap-2"
              >
                Ver Manuales
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-base hover:from-indigo-500 hover:to-purple-500 transition-all shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer group"
              >
                Comenzar ahora
                <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/manual"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-350 font-semibold text-base border border-white/10 transition-all flex items-center justify-center gap-2"
              >
                Ver Manuales
              </Link>
            </>
          )}
        </div>

        {/* Feature Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left mt-16 pt-16 border-t border-white/5">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl relative overflow-hidden group hover:border-indigo-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6">
              <FiCpu className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Ledger Inmutable Go</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Todos los movimientos de inventario son procesados y sellados por un microservicio en Go que notifica y registra firmas directamente en DynamoDB Local, impidiendo alteraciones.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl relative overflow-hidden group hover:border-purple-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-6">
              <FiShield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Firma Criptográfica Dual</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Garantiza la validez de los traslados de activos fijos requiriendo tanto la firma del emisor como la del receptor, simuladas con QR dinámicos interactivos.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl relative overflow-hidden group hover:border-emerald-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6">
              <FiUsers className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Roles y Responsabilidades</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Distinción estricta de rutas y privilegios: Administradores autorizan altas y bajas, mientras que los Auxiliares ejecutan traslados entre aulas, laboratorios y oficinas.
            </p>
          </div>
        </section>

        {/* Roles Details Section */}
        <section className="mt-24 text-left grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-indigo-400 text-xs font-semibold uppercase tracking-wider">Módulos Especializados</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-2 mb-6">
              Dos interfaces distintas adaptadas a las necesidades del personal
            </h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 mt-1">
                  <FiCheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">Panel del Administrador</h4>
                  <p className="text-slate-400 text-sm mt-1">
                    Control absoluto sobre marcas, ubicaciones, tipos de activos y usuarios. Capacidad de dar de baja activos de forma segura y consultar auditorías globales.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 mt-1">
                  <FiCheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">Panel del Auxiliar</h4>
                  <p className="text-slate-400 text-sm mt-1">
                    Flujo de trabajo optimizado para transferencias. El auxiliar emite el movimiento de activos, genera el QR de firma y el receptor aprueba con su correspondiente token.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-1">
                  <FiCheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">Explorador de Integridad Notarial</h4>
                  <p className="text-slate-400 text-sm mt-1">
                    Herramienta de búsqueda directa en el Ledger. Valida instantáneamente si un activo o movimiento ha sido manipulado o si coincide exactamente con el hash del bloque original.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-tr from-slate-900 to-indigo-950 border border-white/10 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-red-500/40" />
                <div className="w-3.5 h-3.5 rounded-full bg-yellow-500/40" />
                <div className="w-3.5 h-3.5 rounded-full bg-green-500/40" />
              </div>
              <span className="text-xs text-slate-500 font-mono">notaria-ledger-explorer.sh</span>
            </div>
            <div className="font-mono text-xs text-indigo-300 space-y-3">
              <p className="text-slate-500">// Consultando firma de bloque en DynamoDB...</p>
              <p className="text-emerald-400">$ curl -X GET http://localhost:3030/api/ledger/movimiento/45a8e2</p>
              <div className="bg-black/40 rounded-xl p-4 text-slate-400 border border-white/5 space-y-1">
                <p><span className="text-purple-400">"contrato_uuid"</span>: "8e9a2d-df78-4a6c-82df-114c0a1a89b0",</p>
                <p><span className="text-purple-400">"estado"</span>: "EJECUTADO",</p>
                <p><span className="text-purple-400">"firma_emisor"</span>: "0x82f91a0c8b21...91ef",</p>
                <p><span className="text-purple-400">"firma_receptor"</span>: "0x09da1b285a8c...fc2a",</p>
                <p><span className="text-purple-400">"hash_integridad"</span>: "7d8f92ae014902ff681da0cf9b87..."</p>
              </div>
              <p className="text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Sincronización exitosa con blockchain local
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-slate-500">
          <p>© {new Date().getFullYear()} Activos FICCT UAGRM. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <span>Ingeniería en Software 2</span>
            <span>Docente: Martinez</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
