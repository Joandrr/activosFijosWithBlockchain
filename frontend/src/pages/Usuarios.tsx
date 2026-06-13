import { useEffect, useState, useCallback } from "react";
import DataTable from "../components/DataTable";
import { usuarioService, rolService, lugarService, responsableLugarService } from "../services";
import type { Usuario, Rol, Lugar, ResponsableLugar } from "../types";
import { useAuth } from "../context/AuthContext";
import { AxiosError } from "axios";
import { FiPlus, FiX, FiUser, FiMail, FiLock, FiCalendar, FiSliders, FiShield, FiTrash2 } from "react-icons/fi";

export default function Usuarios() {
  const [data, setData] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<Rol[]>([]);
  const { user } = useAuth();

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | string | null>(null);
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    genero: "M",
    fecha_nacimiento: "",
    email: "",
    password: "",
    rol_id: "",
    estado: true
  });
  const [saving, setSaving] = useState(false);

  // Responsibility Modal states
  const [isRespModalOpen, setIsRespModalOpen] = useState(false);
  const [responsabilidades, setResponsabilidades] = useState<ResponsableLugar[]>([]);
  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [respForm, setRespForm] = useState({
    usuario_id: "",
    lugar_id: ""
  });
  const [savingResp, setSavingResp] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [usuarios, rolesList, lugaresList, responsabilidadesList] = await Promise.all([
        usuarioService.getAll(),
        rolService.getAll(),
        lugarService.getAll(),
        responsableLugarService.getAll()
      ]);
      setData(usuarios);
      setRoles(rolesList);
      setLugares(lugaresList);
      setResponsabilidades(responsabilidadesList || []);
    } catch {
      setData([]);
      setRoles([]);
      setLugares([]);
      setResponsabilidades([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: number | string) => {
    if (!confirm("¿Eliminar usuario?")) return;
    try {
      await usuarioService.remove(id);
      setData((prev) => prev.filter((d) => d.id !== id));
    } catch (err: unknown) {
      alert(err instanceof AxiosError ? err.response?.data?.message : "Error");
    }
  };

  const openCreateModal = () => {
    setForm({
      nombre: "",
      apellido: "",
      genero: "M",
      fecha_nacimiento: "",
      email: "",
      password: "",
      rol_id: "",
      estado: true
    });
    setEditId(null);
    setIsModalOpen(true);
  };

  const handleEdit = (id: number | string) => {
    const item = data.find((d) => d.id === id);
    if (item) {
      setForm({
        nombre: item.nombre,
        apellido: item.apellido,
        genero: item.genero || "M",
        fecha_nacimiento: item.fecha_nacimiento ? item.fecha_nacimiento.split("T")[0] : "",
        email: item.email,
        password: "", // do not fill password on edit
        rol_id: item.rol_id ? String(item.rol_id) : "",
        estado: item.estado ?? true
      });
      setEditId(id);
      setIsModalOpen(true);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload: any = {
      nombre: form.nombre,
      apellido: form.apellido,
      genero: form.genero,
      fecha_nacimiento: form.fecha_nacimiento || null,
      email: form.email,
      estado: form.estado,
      rol_id: form.rol_id ? Number(form.rol_id) : null
    };

    // Only include password if editing and not empty, or creating
    if (!editId) {
      payload.password = form.password;
    } else if (form.password) {
      payload.password = form.password;
    }

    try {
      if (editId) {
        await usuarioService.update(editId, payload);
      } else {
        await usuarioService.create(payload);
      }
      setIsModalOpen(false);
      load();
    } catch (err: unknown) {
      alert(err instanceof AxiosError ? err.response?.data?.message : "Error al guardar usuario");
    } finally {
      setSaving(false);
    }
  };

  const openResponsableModal = () => {
    setRespForm({ usuario_id: "", lugar_id: "" });
    setIsRespModalOpen(true);
  };

  const handleSaveResponsable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!respForm.usuario_id || !respForm.lugar_id) {
      alert("Por favor seleccione un usuario y un lugar.");
      return;
    }
    setSavingResp(true);
    try {
      await responsableLugarService.create({
        usuario_id: Number(respForm.usuario_id),
        lugar_id: Number(respForm.lugar_id)
      });
      setRespForm({ usuario_id: "", lugar_id: "" });
      load(); // reload lists
    } catch (err: unknown) {
      alert(err instanceof AxiosError ? err.response?.data?.message : "Error al guardar responsabilidad");
    } finally {
      setSavingResp(false);
    }
  };

  const handleDeleteResponsable = async (id: number) => {
    if (!confirm("¿Remover esta responsabilidad?")) return;
    try {
      await responsableLugarService.remove(id);
      load(); // reload lists
    } catch (err: unknown) {
      alert(err instanceof AxiosError ? err.response?.data?.message : "Error al eliminar");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Usuarios</h1>
          <p className="text-sm text-slate-400 mt-0.5">Gestión de usuarios del sistema</p>
        </div>
        {user?.rol_id === 1 && (
          <div className="flex gap-3">
            <button
              onClick={openResponsableModal}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-600/15 cursor-pointer"
            >
              <FiShield size={16} /> Designar Responsabilidad
            </button>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-600/15 cursor-pointer"
            >
              <FiPlus size={16} /> Nuevo Usuario
            </button>
          </div>
        )}
      </div>

      <DataTable<Usuario>
        columns={[
          { key: "id", label: "ID" },
          { key: "nombre", label: "Nombre" },
          { key: "apellido", label: "Apellido" },
          { key: "email", label: "Email" },
          {
            key: "fecha_nacimiento",
            label: "F. Nacimiento",
            render: (v) => (v ? String(v).split("T")[0] : "-"),
          },
          { key: "rol_nombre", label: "Rol" },
          {
            key: "estado",
            label: "Activo",
            render: (v) =>
              v ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Sí</span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-900/40 text-slate-500 border border-white/5">No</span>
              ),
          },
        ]}
        data={data}
        loading={loading}
        onEdit={user?.rol_id === 1 ? handleEdit : undefined}
        onDelete={user?.rol_id === 1 ? handleDelete : undefined}
        searchPlaceholder="Buscar usuario..."
      />

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-opacity duration-300">
          <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl w-full max-w-lg border border-white/10 shadow-2xl overflow-hidden relative transform transition-all text-slate-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <h2 className="text-lg font-bold text-slate-100">
                {editId ? "Editar Usuario" : "Registrar Nuevo Usuario"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-350 mb-1.5 flex items-center gap-1.5">
                    <FiUser className="text-indigo-400" /> Nombre *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    placeholder="Ej. Juan"
                    className="w-full px-3.5 py-2.5 bg-slate-950/40 border border-white/10 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-350 mb-1.5 flex items-center gap-1.5">
                    <FiUser className="text-indigo-400" /> Apellido *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.apellido}
                    onChange={(e) => setForm({ ...form, apellido: e.target.value })}
                    placeholder="Ej. Perez"
                    className="w-full px-3.5 py-2.5 bg-slate-950/40 border border-white/10 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-355 mb-1.5 flex items-center gap-1.5">
                    Género *
                  </label>
                  <select
                    value={form.genero}
                    onChange={(e) => setForm({ ...form, genero: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  >
                    <option value="M" className="bg-slate-950 text-slate-200">Masculino</option>
                    <option value="F" className="bg-slate-950 text-slate-200">Femenino</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-350 mb-1.5 flex items-center gap-1.5">
                    <FiCalendar className="text-indigo-400" /> F. Nacimiento
                  </label>
                  <input
                    type="date"
                    value={form.fecha_nacimiento}
                    onChange={(e) => setForm({ ...form, fecha_nacimiento: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950/40 border border-white/10 rounded-xl text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all [color-scheme:dark]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-350 mb-1.5 flex items-center gap-1.5">
                  <FiMail className="text-indigo-400" /> Email *
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="ejemplo@uagrm.edu.bo"
                  className="w-full px-3.5 py-2.5 bg-slate-955/40 border border-white/10 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-350 mb-1.5 flex items-center gap-1.5">
                  <FiLock className="text-indigo-400" /> Contraseña {!editId && "*"}
                </label>
                <input
                  type="password"
                  required={!editId}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder={editId ? "Dejar vacío para no cambiar" : "••••••••"}
                  className="w-full px-3.5 py-2.5 bg-slate-955/40 border border-white/10 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-350 mb-1.5 flex items-center gap-1.5">
                    <FiSliders className="text-indigo-400" /> Rol *
                  </label>
                  <select
                    required
                    value={form.rol_id}
                    onChange={(e) => setForm({ ...form, rol_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  >
                    <option value="" className="bg-slate-950 text-slate-300">Seleccionar rol...</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id} className="bg-slate-950 text-slate-200">{r.nombre}</option>
                    ))}
                  </select>
                </div>

                {editId && (
                  <div className="flex items-end pb-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.estado}
                        onChange={(e) => setForm({ ...form, estado: e.target.checked })}
                        className="h-4.5 w-4.5 rounded bg-slate-950 border-white/10 text-indigo-600 focus:ring-indigo-500/20 accent-indigo-600"
                      />
                      <span className="text-sm font-medium text-slate-300">Usuario Activo</span>
                    </label>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4.5 py-2.5 rounded-xl border border-white/10 text-slate-300 text-sm font-medium hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4.5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer shadow-lg shadow-indigo-600/20"
                >
                  {saving ? "Guardando..." : editId ? "Guardar Cambios" : "Crear Usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL DESIGNAR RESPONSABILIDAD */}
      {isRespModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-opacity duration-300">
          <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl w-full max-w-xl border border-white/10 shadow-2xl overflow-hidden relative transform transition-all text-slate-100 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <FiShield className="text-emerald-400" /> Designar Responsabilidad de Laboratorio
              </h2>
              <button
                onClick={() => setIsRespModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Formulario de Asignación */}
              <form onSubmit={handleSaveResponsable} className="space-y-4 bg-slate-950/40 p-4 rounded-xl border border-white/5">
                <h3 className="text-sm font-bold text-slate-350 flex items-center gap-1.5">Designar Responsable</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Seleccionar Auxiliar *
                    </label>
                    <select
                      required
                      value={respForm.usuario_id}
                      onChange={(e) => setRespForm({ ...respForm, usuario_id: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    >
                      <option value="" className="bg-slate-900 text-slate-400">Seleccionar...</option>
                      {data.filter(u => u.rol_id === 2 || u.rol_id === 3 || u.rol_id === 4).map((u) => (
                        <option key={u.id} value={u.id} className="bg-slate-900 text-slate-200">{u.nombre} {u.apellido}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Ubicación/Laboratorio *
                    </label>
                    <select
                      required
                      value={respForm.lugar_id}
                      onChange={(e) => setRespForm({ ...respForm, lugar_id: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    >
                      <option value="" className="bg-slate-900 text-slate-400">Seleccionar...</option>
                      {lugares.map((l) => (
                        <option key={l.id} value={l.id} className="bg-slate-900 text-slate-200">{l.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={savingResp}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold disabled:opacity-50 transition-colors shadow-md shadow-emerald-600/10 cursor-pointer"
                  >
                    {savingResp ? "Guardando..." : "Asignar Responsabilidad"}
                  </button>
                </div>
              </form>

              {/* Listado de Asignaciones Actuales */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-300">Asignaciones de Laboratorio Activas</h3>
                <div className="border border-white/5 rounded-xl overflow-hidden bg-slate-950/20">
                  <div className="max-h-48 overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 bg-slate-950/40 text-[10px] uppercase font-bold text-slate-400">
                          <th className="px-4 py-2.5">Auxiliar</th>
                          <th className="px-4 py-2.5">Lugar / Laboratorio</th>
                          <th className="px-4 py-2.5 text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {responsabilidades.map((r) => {
                          const auxUser = data.find(u => u.id === r.usuario_id);
                          const assignedPlace = lugares.find(l => l.id === r.lugar_id);
                          return (
                            <tr key={r.id} className="border-b border-white/5 text-xs text-slate-300 hover:bg-white/5 transition-colors">
                              <td className="px-4 py-2.5 font-medium">
                                {auxUser ? `${auxUser.nombre} ${auxUser.apellido}` : `ID: ${r.usuario_id}`}
                              </td>
                              <td className="px-4 py-2.5 text-slate-400">
                                {assignedPlace ? assignedPlace.nombre : `ID: ${r.lugar_id}`}
                              </td>
                              <td className="px-4 py-2.5 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteResponsable(r.id)}
                                  className="p-1 rounded bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                                  title="Remover responsabilidad"
                                >
                                  <FiTrash2 size={13} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                        {responsabilidades.length === 0 && (
                          <tr>
                            <td colSpan={3} className="px-4 py-6 text-center text-slate-500 italic text-xs">
                              No hay responsabilidades designadas aún.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-950/30 border-t border-white/5 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setIsRespModalOpen(false)}
                className="px-4.5 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-750 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
