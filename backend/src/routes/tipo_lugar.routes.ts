import { Router } from "express";
import { getAll, getById, create, update, remove } from "../controllers/tipo_lugar.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

export const tipoLugarRouter = Router();
tipoLugarRouter.get("/", authenticate, getAll);
tipoLugarRouter.get("/:id", authenticate, getById);
tipoLugarRouter.post("/", authenticate, create);
tipoLugarRouter.put("/:id", authenticate, update);
tipoLugarRouter.delete("/:id", authenticate, remove);
