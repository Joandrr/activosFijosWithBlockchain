import { Router } from "express";
import { getAll, getById, create, update, remove, getByTipo } from "../controllers/detalle_tipo.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

export const detalleTipoRouter = Router();
detalleTipoRouter.get("/", authenticate, getAll);
detalleTipoRouter.get("/:id", authenticate, getById);
detalleTipoRouter.post("/", authenticate, create);
detalleTipoRouter.put("/:id", authenticate, update);
detalleTipoRouter.delete("/:id", authenticate, remove);
detalleTipoRouter.get("/por-tipo/:tipoId", authenticate, getByTipo);
