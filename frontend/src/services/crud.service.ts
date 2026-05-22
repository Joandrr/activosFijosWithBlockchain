import { apiGet, apiPost, apiPut, apiDelete } from "./api";

export function createService<T extends { id: number | string }>(basePath: string) {
  return {
    getAll: () => apiGet<T[]>(basePath),
    getById: (id: number | string) => apiGet<T>(`${basePath}/${id}`),
    create: (data: Partial<T>) => apiPost<T>(basePath, data),
    update: (id: number | string, data: Partial<T>) => apiPut<T>(`${basePath}/${id}`, data),
    remove: (id: number | string) => apiDelete<{ message: string }>(`${basePath}/${id}`),
    custom: <R = unknown>(method: "get" | "post" | "put" | "delete", path: string, data?: unknown) => {
      const url = `${basePath}/${path}`;
      switch (method) {
        case "get": return apiGet<R>(url);
        case "post": return apiPost<R>(url, data);
        case "put": return apiPut<R>(url, data);
        case "delete": return apiDelete<R>(url);
      }
    },
  };
}
