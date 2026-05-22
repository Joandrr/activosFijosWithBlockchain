import { Router } from "express";
import { getAll, getById, create, update, remove } from "../controllers/movimiento.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

export const movimientoRouter = Router();
movimientoRouter.get("/", authenticate, getAll);
movimientoRouter.get("/:id", authenticate, getById);
movimientoRouter.post("/", authenticate, create);
movimientoRouter.put("/:id", authenticate, update);
movimientoRouter.delete("/:id", authenticate, remove);
