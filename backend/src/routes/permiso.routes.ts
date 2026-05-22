import { Router } from "express";
import { getAll, create, remove, assignToRol, removeFromRol, getPermisosByRol } from "../controllers/permiso.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

export const permisoRouter = Router();
permisoRouter.get("/", authenticate, getAll);
permisoRouter.post("/", authenticate, authorize(1), create);
permisoRouter.delete("/:id", authenticate, authorize(1), remove);
permisoRouter.post("/asignar", authenticate, authorize(1), assignToRol);
permisoRouter.post("/quitar", authenticate, authorize(1), removeFromRol);
permisoRouter.get("/por-rol/:rolId", authenticate, getPermisosByRol);
