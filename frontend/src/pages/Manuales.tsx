import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiShield, FiUser, FiCheckCircle, FiInfo, FiAlertCircle, FiSettings, FiArrowLeft, FiLogIn } from "react-icons/fi";

interface ManualesProps {
  isPublic?: boolean;
}

type RoleTab = "admin" | "auxiliar" | "receptor" | "auditor";

export default function Manuales({ isPublic = false }: ManualesProps) {
  const { user } = useAuth();
  const [activeRole, setActiveRole] = useState<RoleTab>("auxiliar");

  // Autodetect logged-in user role and focus on that tab
  useEffect(() => {
    if (!isPublic && user) {
      if (user.rol_id === 1) {
        setActiveRole("admin");
      } else if (user.rol_id === 3 || user.rol_id === 4) {
        setActiveRole("receptor");
      } else {
        setActiveRole("auxiliar");
      }
    }
  }, [user, isPublic]);

  const roles = [
    { id: "admin" as RoleTab, label: "Administrador", desc: "Gestión global de inventario, bajas y accesos", icon: FiSettings, color: "from-purple-500 to-indigo-600" },
    { id: "auxiliar" as RoleTab, label: "Auxiliar (Emisor)", desc: "Inicio de traslados y firmas de salida", icon: FiUser, color: "from-indigo-500 to-blue-600" },
    { id: "receptor" as RoleTab, label: "Jefe de Centro / Administrativo", desc: "Firmas de recepción y asignación física", icon: FiCheckCircle, color: "from-emerald-500 to-teal-600" },
    { id: "auditor" as RoleTab, label: "Auditor (Validador)", desc: "Auditoría notarial e integridad", icon: FiShield, color: "from-amber-500 to-orange-600" },
  ];

  return (
    <div className={`space-y-8 ${isPublic ? "min-h-screen bg-slate-950 text-slate-100 p-6 sm:p-12 relative overflow-hidden font-sans select-none" : "animate-in fade-in duration-300"}`}>
      
      {/* Decorative Orbs if Public */}
      {isPublic && (
        <>
          <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
        </>
      )}

      {/* Header Bar */}
      {isPublic ? (
        <header className="max-w-7xl mx-auto flex items-center justify-between border-b border-white/5 pb-6 mb-8 relative z-10">
          <div className="flex items-center gap-3">
            <Link to="/" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors mr-4 bg-slate-900 border border-white/10 px-3.5 py-1.5 rounded-xl text-sm font-semibold cursor-pointer">
              <FiArrowLeft size={16} /> Volver a Home
            </Link>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
              AF
            </div>
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent hidden sm:block">
              Activos FICCT
            </span>
          </div>
          <div>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4.5 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-600/15 cursor-pointer"
            >
              <FiLogIn size={16} /> Iniciar Sesión
            </Link>
          </div>
        </header>
      ) : (
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-100">Manuales de Usuario</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Flujos de trabajo interactivos paso a paso organizados por responsabilidades.
          </p>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <div className={`max-w-7xl mx-auto relative z-10 ${isPublic ? "space-y-8" : "space-y-6"}`}>
        
        {/* Detect user role notification */}
        {!isPublic && user && (
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 flex items-center gap-3 animate-pulse-subtle">
            <FiInfo className="text-indigo-400 shrink-0" size={18} />
            <p className="text-xs text-indigo-200">
              Hemos detectado tu rol actual como <strong>{user.rol_id === 1 ? "Administrador" : user.rol_id === 3 ? "Administrativo" : user.rol_id === 4 ? "Jefe de Centro" : "Auxiliar"}</strong>. Te recomendamos consultar la guía específica marcada a continuación.
            </p>
          </div>
        )}

        {/* Roles Selector Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {roles.map((r) => {
            const Icon = r.icon;
            const active = activeRole === r.id;
            const isUserRole = !isPublic && user && (
              (r.id === "admin" && user.rol_id === 1) ||
              (r.id === "receptor" && (user.rol_id === 3 || user.rol_id === 4)) ||
              (r.id === "auxiliar" && user.rol_id !== 1 && user.rol_id !== 3 && user.rol_id !== 4)
            );

            return (
              <button
                key={r.id}
                onClick={() => setActiveRole(r.id)}
                className={`relative flex flex-col items-start text-left p-5 rounded-3xl border transition-all duration-300 overflow-hidden cursor-pointer ${
                  active
                    ? "bg-slate-900 border-indigo-500/50 shadow-lg shadow-indigo-500/5"
                    : "bg-slate-900/40 border-white/5 hover:border-white/10 hover:bg-slate-900/60"
                }`}
              >
                {/* Glow background if active */}
                {active && (
                  <div className="absolute -top-12 -right-12 w-28 h-28 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
                )}

                {/* Badge for user role */}
                {isUserRole && (
                  <span className="absolute top-3 right-3 text-[9px] font-bold px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full uppercase tracking-wider">
                    Tu Perfil
                  </span>
                )}

                <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${r.color} flex items-center justify-center text-white mb-4 shadow-md`}>
                  <Icon size={20} />
                </div>
                <h4 className="font-bold text-sm text-slate-200">{r.label}</h4>
                <p className="text-[11px] text-slate-450 mt-1 leading-normal">{r.desc}</p>
              </button>
            );
          })}
        </div>

        {/* WORKFLOW CONTENT */}
        <div className="bg-slate-900/60 border border-white/5 backdrop-blur-xl rounded-3xl p-6 sm:p-8 space-y-8 shadow-xl">
          
          {activeRole === "admin" && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div>
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <FiSettings className="text-purple-400" /> Manual de Operaciones de Administrador
                </h3>
                <p className="text-xs text-slate-400 mt-1">Acciones exclusivas para la gestión global y notarización de inventarios.</p>
              </div>

              {/* FLOW 1: CREATE ASSET */}
              <div className="space-y-4 border-b border-white/5 pb-8">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full uppercase">FLUJO A</span>
                  <h4 className="font-extrabold text-sm text-slate-200">Registrar un Nuevo Activo (Alta de Bien)</h4>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    {/* Pipeline / Steps */}
                    <div className="relative pl-6 border-l border-white/10 space-y-5">
                      <div className="relative">
                        <span className="absolute -left-[30px] top-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-slate-800 text-[10px] font-bold border border-slate-700">1</span>
                        <p className="text-xs font-bold text-slate-300">Ir al catálogo de Activos</p>
                        <p className="text-[11px] text-slate-450 mt-0.5">En el menú de navegación lateral, haz clic en el botón <strong className="text-indigo-400 font-medium">"Activos"</strong>.</p>
                      </div>
                      <div className="relative">
                        <span className="absolute -left-[30px] top-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-slate-800 text-[10px] font-bold border border-slate-700">2</span>
                        <p className="text-xs font-bold text-slate-300">Abrir formulario de creación</p>
                        <p className="text-[11px] text-slate-450 mt-0.5">En la esquina superior derecha, haz clic en el botón azul <strong className="text-indigo-400 font-medium">"+ Nuevo Activo"</strong>.</p>
                      </div>
                      <div className="relative">
                        <span className="absolute -left-[30px] top-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-slate-800 text-[10px] font-bold border border-slate-700">3</span>
                        <p className="text-xs font-bold text-slate-300">Completar la ficha del activo</p>
                        <p className="text-[11px] text-slate-450 mt-0.5">Ingresa Código (ej. ACT-COM-010), Nombre, y selecciona Tipo, Marca y Aula/Ubicación actual.</p>
                      </div>
                      <div className="relative">
                        <span className="absolute -left-[30px] top-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-indigo-600 text-[10px] font-bold border border-indigo-500 text-white">4</span>
                        <p className="text-xs font-bold text-indigo-400">Crear y Notarizar</p>
                        <p className="text-[11px] text-slate-450 mt-0.5">Presiona <strong className="text-indigo-400 font-medium">"Crear Activo"</strong>. El sistema enviará los datos al ledger local en DynamoDB para firmar el ingreso.</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-4 text-xs text-slate-350 space-y-3">
                    <h5 className="font-bold text-slate-200 flex items-center gap-1.5"><FiShield className="text-emerald-400 animate-pulse" /> Sello de Creación</h5>
                    <p className="leading-relaxed">Al crearse, verás que el activo muestra la etiqueta **"Firmado (Notaría)"**.</p>
                    <p className="leading-relaxed">El sistema le asigna un código **UUID de Contrato** que sirve para auditar la legitimidad del registro en cualquier momento.</p>
                  </div>
                </div>
              </div>

              {/* FLOW 2: DELETE / RETIRE ASSET */}
              <div className="space-y-4 border-b border-white/5 pb-8">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full uppercase">FLUJO B</span>
                  <h4 className="font-extrabold text-sm text-slate-200">Dar de Baja un Activo Fijo (Retiro de Inventario)</h4>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <div className="relative pl-6 border-l border-white/10 space-y-5">
                      <div className="relative">
                        <span className="absolute -left-[30px] top-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-slate-800 text-[10px] font-bold border border-slate-700">1</span>
                        <p className="text-xs font-bold text-slate-300">Buscar activo en inventario</p>
                        <p className="text-[11px] text-slate-455 mt-0.5">Ve al menú **Activos** y utiliza la barra de búsqueda para ubicar el activo por código.</p>
                      </div>
                      <div className="relative">
                        <span className="absolute -left-[30px] top-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-slate-800 text-[10px] font-bold border border-slate-700">2</span>
                        <p className="text-xs font-bold text-slate-300">Hacer clic en dar de baja</p>
                        <p className="text-[11px] text-slate-455 mt-0.5">Presiona el botón de eliminar (icono de basurero o acción **"Dar de baja"**).</p>
                      </div>
                      <div className="relative">
                        <span className="absolute -left-[30px] top-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-rose-600 text-[10px] font-bold border border-rose-500 text-white">3</span>
                        <p className="text-xs font-bold text-rose-400">Confirmar baja digital</p>
                        <p className="text-[11px] text-slate-455 mt-0.5">Acepta la confirmación en el cuadro emergente para generar una firma de desincorporación irreversible.</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-rose-950/10 border border-rose-500/10 rounded-2xl p-4 text-xs text-rose-350 space-y-3">
                    <h5 className="font-bold text-rose-300 flex items-center gap-1.5"><FiAlertCircle size={15} /> Retiro Criptográfico</h5>
                    <p className="leading-relaxed">Una vez dado de baja, se bloquean permanentemente todos los traslados del activo.</p>
                    <p className="leading-relaxed">La firma de baja queda registrada en DynamoDB de forma pública para auditorías.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeRole === "auxiliar" && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div>
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <FiUser className="text-indigo-400" /> Manual de Operaciones de Auxiliar
                </h3>
                <p className="text-xs text-slate-400 mt-1">Control diario del inventario físico y emisión de movimientos de traslado.</p>
              </div>

              {/* FLOW 1: NEW MOVEMENT */}
              <div className="space-y-4 border-b border-white/5 pb-8">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full uppercase">FLUJO A</span>
                  <h4 className="font-extrabold text-sm text-slate-200">Crear un Nuevo Traslado de Activos</h4>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <div className="relative pl-6 border-l border-white/10 space-y-5">
                      <div className="relative">
                        <span className="absolute -left-[30px] top-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-slate-800 text-[10px] font-bold border border-slate-700">1</span>
                        <p className="text-xs font-bold text-slate-300">Ir a la sección de Movimientos</p>
                        <p className="text-[11px] text-slate-450 mt-0.5">En el menú lateral, selecciona **"Movimientos"**.</p>
                      </div>
                      <div className="relative">
                        <span className="absolute -left-[30px] top-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-slate-800 text-[10px] font-bold border border-slate-700">2</span>
                        <p className="text-xs font-bold text-slate-300">Iniciar Nuevo Movimiento</p>
                        <p className="text-[11px] text-slate-450 mt-0.5">Presiona el botón azul **"+ Nuevo Movimiento"** en la parte superior derecha.</p>
                      </div>
                      <div className="relative">
                        <span className="absolute -left-[30px] top-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-slate-800 text-[10px] font-bold border border-slate-700">3</span>
                        <p className="text-xs font-bold text-slate-300">Completar formulario de origen y destino</p>
                        <p className="text-[11px] text-slate-450 mt-0.5">Selecciona el Activo. El sistema cargará el aula origen y a ti como emisor. Luego elige el destino.</p>
                      </div>
                      <div className="relative">
                        <span className="absolute -left-[30px] top-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-indigo-600 text-[10px] font-bold border border-indigo-500 text-white">4</span>
                        <p className="text-xs font-bold text-indigo-400">Crear en estado "En Proceso"</p>
                        <p className="text-[11px] text-slate-450 mt-0.5">Presiona **"Crear Movimiento"**. La solicitud se registrará como *En Proceso* esperando firmas.</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-indigo-950/10 border border-indigo-500/10 rounded-2xl p-4 text-xs text-indigo-350 space-y-3">
                    <h5 className="font-bold text-indigo-300 flex items-center gap-1.5"><FiInfo size={15} /> Asignación Inteligente</h5>
                    <p className="leading-relaxed">El sistema identifica de forma automatizada al responsable de la ubicación destino para notificarle sobre la recepción.</p>
                  </div>
                </div>
              </div>

              {/* FLOW 2: SIGN EMISOR */}
              <div className="space-y-4 border-b border-white/5 pb-8">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full uppercase">FLUJO B</span>
                  <h4 className="font-extrabold text-sm text-slate-200">Firmar como Emisor (Autorización de Salida)</h4>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <div className="relative pl-6 border-l border-white/10 space-y-5">
                      <div className="relative">
                        <span className="absolute -left-[30px] top-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-slate-800 text-[10px] font-bold border border-slate-700">1</span>
                        <p className="text-xs font-bold text-slate-300">Abrir Panel de Firmas</p>
                        <p className="text-[11px] text-slate-455 mt-0.5">En la fila del traslado en **Movimientos**, presiona el botón **"Panel Firmas"**.</p>
                      </div>
                      <div className="relative">
                        <span className="absolute -left-[30px] top-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-slate-800 text-[10px] font-bold border border-slate-700">2</span>
                        <p className="text-xs font-bold text-slate-300">Ejecutar Firma Digital</p>
                        <p className="text-[11px] text-slate-455 mt-0.5">Haz clic en **"Firmar Emisor"** desde la web, o escanea el **Código QR Paso 1** con la app móvil.</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-4 text-xs text-slate-350 space-y-3 flex flex-col items-center justify-center">
                    <p className="font-bold text-slate-200 text-center mb-1">Escanear con App Móvil</p>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent("activos-app://demo-sign-emisor")}`}
                      alt="QR Demo Emisor"
                      className="w-24 h-24 bg-white p-1 rounded-lg"
                    />
                    <p className="text-[9px] text-slate-500 text-center">QR para app móvil (Paso 1)</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeRole === "receptor" && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div>
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <FiCheckCircle className="text-emerald-400" /> Manual de Jefe de Centro / Administrativo (Receptor)
                </h3>
                <p className="text-xs text-slate-400 mt-1">Autorización de ingresos y formalización final de los traslados de activos fijos.</p>
              </div>

              {/* FLOW 1: RECEIVE ASSET */}
              <div className="space-y-4 border-b border-white/5 pb-8">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase">FLUJO A</span>
                  <h4 className="font-extrabold text-sm text-slate-200">Firmar Recepción de Activos (Entrada)</h4>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <div className="relative pl-6 border-l border-white/10 space-y-5">
                      <div className="relative">
                        <span className="absolute -left-[30px] top-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-slate-800 text-[10px] font-bold border border-slate-700">1</span>
                        <p className="text-xs font-bold text-slate-300">Localizar el traslado pendiente</p>
                        <p className="text-[11px] text-slate-450 mt-0.5">Ve a **Movimientos** y busca el traslado que dirá *Firma Emisor: Firmado* y *Firma Receptor: Pendiente*.</p>
                      </div>
                      <div className="relative">
                        <span className="absolute -left-[30px] top-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-slate-800 text-[10px] font-bold border border-slate-700">2</span>
                        <p className="text-xs font-bold text-slate-300">Abrir Panel Firmas</p>
                        <p className="text-[11px] text-slate-450 mt-0.5">Presiona **"Panel Firmas"** en la fila correspondiente.</p>
                      </div>
                      <div className="relative">
                        <span className="absolute -left-[30px] top-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-emerald-600 text-[10px] font-bold border border-emerald-500 text-white">3</span>
                        <p className="text-xs font-bold text-emerald-400">Firmar Entrada</p>
                        <p className="text-[11px] text-slate-450 mt-0.5">Haz clic en **"Firmar Receptor"** en la web, o escanea el **Código QR Paso 2** con tu teléfono.</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-emerald-950/10 border border-emerald-500/10 rounded-2xl p-4 text-xs text-emerald-350 space-y-3">
                    <h5 className="font-bold text-emerald-300 flex items-center gap-1.5"><FiCheckCircle size={15} /> Traslado Oficializado</h5>
                    <p className="leading-relaxed">Al firmar como Receptor, la ubicación física del activo en PostgreSQL se actualiza al instante al aula de destino y el contrato se marca como `EJECUTADO` en el ledger de DynamoDB.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeRole === "auditor" && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div>
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <FiShield className="text-amber-400" /> Manual de Auditoría y Validador Notarial
                </h3>
                <p className="text-xs text-slate-400 mt-1">Cómo verificar matemáticamente la integridad criptográfica de un activo o traslado.</p>
              </div>

              {/* FLOW 1: AUDIT CONTRACT */}
              <div className="space-y-4 border-b border-white/5 pb-8">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase">FLUJO A</span>
                  <h4 className="font-extrabold text-sm text-slate-200">Verificar la Autenticidad de un Contrato</h4>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <div className="relative pl-6 border-l border-white/10 space-y-5">
                      <div className="relative">
                        <span className="absolute -left-[30px] top-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-slate-800 text-[10px] font-bold border border-slate-700">1</span>
                        <p className="text-xs font-bold text-slate-300">Copiar el UUID del contrato</p>
                        <p className="text-[11px] text-slate-450 mt-0.5">Copia el ID del Contrato desde la ficha de activos o desde el recibo de movimientos.</p>
                      </div>
                      <div className="relative">
                        <span className="absolute -left-[30px] top-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-slate-800 text-[10px] font-bold border border-slate-700">2</span>
                        <p className="text-xs font-bold text-slate-300">Ir al Validador Notarial</p>
                        <p className="text-[11px] text-slate-450 mt-0.5">En el menú lateral, selecciona **"Validador Notarial"**.</p>
                      </div>
                      <div className="relative">
                        <span className="absolute -left-[30px] top-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-amber-600 text-[10px] font-bold border border-amber-500 text-white">3</span>
                        <p className="text-xs font-bold text-amber-400">Auditar contrato</p>
                        <p className="text-[11px] text-slate-450 mt-0.5">Pega el UUID en la barra de búsqueda y presiona **"Auditar Contrato"**.</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-amber-950/10 border border-amber-500/10 rounded-2xl p-4 text-xs text-amber-350 space-y-3">
                    <h5 className="font-bold text-amber-300 flex items-center gap-1.5"><FiShield size={15} /> Seguridad Blockchain</h5>
                    <p className="leading-relaxed">Si los datos han sido adulterados de forma maliciosa en PostgreSQL, el validador dará una alerta en rojo indicando que las firmas en DynamoDB no coinciden con el registro actual.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
