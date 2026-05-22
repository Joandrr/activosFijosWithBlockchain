import { Router } from "express";
import { getAll, getById, create, update, remove } from "../controllers/usuario.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

export const usuarioRouter = Router();
usuarioRouter.get("/", authenticate, getAll);
usuarioRouter.get("/:id", authenticate, getById);
usuarioRouter.post("/", authenticate, authorize(1), create);
usuarioRouter.put("/:id", authenticate, update);
usuarioRouter.delete("/:id", authenticate, authorize(1), remove);
