import { useState, useMemo } from "react";
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface Column<T> {
  key: string;
  label: string;
  render?: (value: unknown, row: T) => React.ReactNode;
}

interface Props<T extends { id: number | string }> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  onEdit?: (id: number | string) => void;
  onDelete?: (id: number | string) => void;
  createLink?: string;
  createLabel?: string;
  searchPlaceholder?: string;
}

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr className="border-b border-white/5">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-4">
          <div className="h-4 bg-slate-800/60 rounded animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
        </td>
      ))}
    </tr>
  );
}

export default function DataTable<T extends { id: number | string }>({
  columns, data, loading, onEdit, onDelete, createLink, createLabel, searchPlaceholder,
}: Props<T>) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const perPage = 10;

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        const val = (row as Record<string, unknown>)[col.key];
        return String(val ?? "").toLowerCase().includes(q);
      })
    );
  }, [data, search, columns]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice(page * perPage, (page + 1) * perPage);

  useMemo(() => { if (page >= totalPages) setPage(0); }, [page, totalPages]);

  if (loading) {
    return (
      <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/5"><div className="h-9 w-64 bg-slate-850 rounded-lg animate-pulse" /></div>
        <table className="w-full"><tbody>{Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={columns.length + ((onEdit || onDelete) ? 1 : 0)} />)}</tbody></table>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-xs">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder={searchPlaceholder || "Buscar..."}
            className="w-full pl-9 pr-4 py-2 bg-slate-900/40 border border-white/10 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
          />
        </div>
        {createLink && (
          <a href={createLink} className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-600/15">
            <FiPlus size={16} /> {createLabel || "Nuevo"}
          </a>
        )}
      </div>

      <div className="bg-slate-900/30 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-slate-950/20">
                {columns.map((col) => (
                  <th key={col.key} className="text-left px-4 py-4 font-bold text-slate-400 text-xs uppercase tracking-wider">{col.label}</th>
                ))}
                {(onEdit || onDelete) && <th className="text-left px-4 py-4 font-bold text-slate-400 text-xs uppercase tracking-wider">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginated.map((row) => (
                <tr key={row.id} className="hover:bg-white/5 transition-all">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3.5 text-slate-300 font-medium">
                      {col.render ? col.render((row as Record<string, unknown>)[col.key], row) : String((row as Record<string, unknown>)[col.key] ?? "-")}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="px-4 py-3.5">
                      <div className="flex gap-1.5">
                        {onEdit && (
                          <button onClick={() => onEdit(row.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all cursor-pointer">
                            <FiEdit2 size={15} />
                          </button>
                        )}
                        {onDelete && (
                          <button onClick={() => onDelete(row.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer">
                            <FiTrash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr><td colSpan={columns.length + ((onEdit || onDelete) ? 1 : 0)} className="text-center py-12 text-slate-500">Sin registros</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3.5 border-t border-white/5 bg-slate-950/10">
            <span className="text-xs text-slate-500">{page * perPage + 1}-{Math.min((page + 1) * perPage, filtered.length)} de {filtered.length}</span>
            <div className="flex gap-1">
              <button disabled={page === 0} onClick={() => setPage(page - 1)} className="p-1.5 rounded-lg text-slate-400 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed">
                <FiChevronLeft size={16} />
              </button>
              <button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)} className="p-1.5 rounded-lg text-slate-400 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed">
                <FiChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
