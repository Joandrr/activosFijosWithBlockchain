import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { SelectOption } from "../types";

interface Field {
  name: string;
  label: string;
  type?: "text" | "number" | "select" | "date" | "textarea";
  required?: boolean;
  options?: SelectOption[];
  placeholder?: string;
}

interface Props {
  title: string;
  fields: Field[];
  service: {
    getById: (id: number | string) => Promise<Record<string, unknown>>;
    create: (data: Record<string, unknown>) => Promise<unknown>;
    update: (id: number | string, data: Record<string, unknown>) => Promise<unknown>;
  };
  backPath: string;
  transform?: (data: Record<string, unknown>) => Record<string, unknown>;
}

export default function EntityForm({ title, fields, service, backPath, transform }: Props) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      service.getById(id!).then((data) => {
        setForm(data);
        setLoading(false);
      });
    }
  }, [id, isEdit, service]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = transform ? transform(form) : form;
      if (isEdit) {
        await service.update(id!, payload);
      } else {
        await service.create(payload);
      }
      navigate(backPath);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto animate-pulse space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded-lg" />
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-10 bg-slate-100 rounded-lg" />)}
          <div className="h-10 w-32 bg-slate-200 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-slate-800 mb-6">{isEdit ? `Editar ${title}` : `Nuevo ${title}`}</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
        {fields.map(({ name, label, type = "text", required, options, placeholder }) => (
          <div key={name}>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
            {type === "select" ? (
              <select
                value={String(form[name] ?? "")}
                onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                required={required}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-white"
              >
                <option value="">Seleccionar...</option>
                {options?.map((opt) => (
                  <option key={String(opt.value)} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            ) : type === "textarea" ? (
              <textarea
                value={String(form[name] ?? "")}
                onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                required={required}
                placeholder={placeholder}
                rows={4}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none"
              />
            ) : (
              <input
                type={type}
                value={String(form[name] ?? "")}
                onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                required={required}
                placeholder={placeholder}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              />
            )}
          </div>
        ))}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {saving ? "Guardando..." : isEdit ? "Actualizar" : "Crear"}
          </button>
          <button
            type="button"
            onClick={() => navigate(backPath)}
            className="bg-white text-slate-600 px-5 py-2.5 rounded-xl text-sm font-medium border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
