import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AxiosError } from "axios";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre: "", apellido: "", genero: "M" as "M" | "F", email: "", password: "", rol_id: 2 });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof AxiosError ? err.response?.data?.message : "Error al registrarse";
      setError(msg || "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl">
            <span className="text-white font-bold text-2xl">AF</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Crear Cuenta</h1>
          <p className="text-sm text-white/60 mt-1">Regístrate en el sistema</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20 space-y-4">
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-2.5 text-sm text-red-200 text-center">{error}</div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">Nombre</label>
              <input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                placeholder="Juan" className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 text-sm focus:ring-2 focus:ring-white/30 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">Apellido</label>
              <input required value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })}
                placeholder="Pérez" className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 text-sm focus:ring-2 focus:ring-white/30 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">Género</label>
            <select value={form.genero} onChange={(e) => setForm({ ...form, genero: e.target.value as "M" | "F" })}
              className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:ring-2 focus:ring-white/30 outline-none">
              <option value="M" className="text-slate-800">Masculino</option>
              <option value="F" className="text-slate-800">Femenino</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">Email</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="tu@email.com" className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 text-sm focus:ring-2 focus:ring-white/30 outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">Contraseña</label>
            <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••" className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 text-sm focus:ring-2 focus:ring-white/30 outline-none" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-white text-indigo-900 rounded-xl font-semibold text-sm hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">
            {loading ? "Registrando..." : "Registrarse"}
          </button>

          <p className="text-center text-sm text-white/50">
            ¿Ya tienes cuenta? <Link to="/login" className="text-white/80 hover:text-white underline underline-offset-2">Inicia sesión</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
