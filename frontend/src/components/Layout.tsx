import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: "layout-dashboard" },
  { to: "/activos", label: "Activos", icon: "package" },
  { to: "/movimientos", label: "Movimientos", icon: "transfer" },
  { to: "/validador", label: "Validador Notarial", icon: "shield" },
  { to: "/manuales", label: "Manuales", icon: "book-open" },
  { to: "/administracion", label: "Administración", icon: "settings", adminOnly: true },
  { to: "/usuarios", label: "Usuarios", icon: "users", adminOnly: true },
];

function SvgIcon({ name, className = "w-5 h-5" }: { name: string; className?: string }) {
  const paths: Record<string, string> = {
    "layout-dashboard": "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z",
    "package": "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
    "transfer": "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4",
    "shield": "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    "book-open": "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    "settings": "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
    "users": "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z",
    "log-out": "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
    "menu": "M4 6h16M4 12h16M4 18h16",
    "x": "M6 18L18 6M6 6l12 12",
    "chevron-left": "M15 19l-7-7 7-7",
    "chevron-right": "M9 5l7 7-7 7",
  };

  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d={paths[name] || ""} />
    </svg>
  );
}

export function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

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

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* SIDEBAR */}
      <aside
        style={{ width: collapsed ? "4rem" : "16rem" }}
        className={`
          fixed inset-y-0 left-0 z-30 bg-slate-900/40 backdrop-blur-xl border-r border-white/5 shadow-2xl
          transform transition-all duration-250 ease-in-out flex flex-col
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:inset-auto
        `}
      >
        {/* Logo */}
        <div className={`h-16 flex items-center border-b border-white/5 bg-slate-950/20 shrink-0 transition-all duration-250 ${collapsed ? "justify-center px-2" : "gap-3 px-6"}`}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-600/10 shrink-0">
            AF
          </div>
          <div className={`overflow-hidden transition-all duration-250 ${collapsed ? "w-0 opacity-0" : "w-auto opacity-100"}`}>
            <h1 className="font-bold text-slate-200 text-sm leading-tight whitespace-nowrap">Activos FICCT</h1>
            <p className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider whitespace-nowrap">
              {user?.rol_id === 1 ? "Administrador" : user?.rol_id === 3 ? "Administrativo" : user?.rol_id === 4 ? "Jefe Centro" : "Auxiliar"}
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="p-2 space-y-0.5 overflow-y-auto overflow-x-hidden flex-1">
          {nav.filter(item => !item.adminOnly || user?.rol_id === 1).map(({ to, label, icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                title={collapsed ? label : undefined}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${collapsed ? "justify-center" : ""} ${
                  active
                    ? "bg-indigo-600/20 text-white border border-indigo-500/20 shadow-md shadow-indigo-500/5"
                    : "text-slate-400 hover:bg-white/5 hover:text-white border border-transparent"
                }`}
              >
                <SvgIcon name={icon} className={`w-5 h-5 shrink-0 ${active ? "text-indigo-400" : "text-slate-500"}`} />
                <span className={`truncate transition-all duration-200 ${collapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100"}`}>
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Profile + Logout */}
        <div className="p-2 border-t border-white/5 bg-slate-900/40 backdrop-blur-xl shrink-0">
          {!collapsed && (
            <div className="flex items-center gap-3 px-3 py-2 mb-1 border-b border-white/5 pb-2">
              <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold text-xs shrink-0">
                {user?.nombre?.charAt(0)}{user?.apellido?.charAt(0)}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-300 leading-none">{user?.nombre} {user?.apellido}</p>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">{user?.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            title={collapsed ? "Cerrar sesión" : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all cursor-pointer ${collapsed ? "justify-center" : ""}`}
          >
            <SvgIcon name="log-out" className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-slate-900/20 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10">
          {/* Mobile: hamburger */}
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-slate-400 transition-colors cursor-pointer"
          >
            <SvgIcon name="menu" className="w-5 h-5" />
          </button>

          {/* Desktop: collapse toggle */}
          <button
            onClick={() => setCollapsed(c => !c)}
            className="hidden lg:flex items-center justify-center p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            title={collapsed ? "Expandir menú" : "Colapsar menú"}
          >
            <SvgIcon name={collapsed ? "chevron-right" : "chevron-left"} className="w-5 h-5" />
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer ml-2"
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

          <div className="flex items-center gap-3 ml-auto">
            <span className="text-xs text-slate-500 hidden sm:block">
              {user?.nombre} {user?.apellido}
            </span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-indigo-600/10">
              {user?.nombre?.charAt(0)}{user?.apellido?.charAt(0)}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-8 bg-slate-950/40 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
