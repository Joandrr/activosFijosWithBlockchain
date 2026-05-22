import { Router } from "express";
import { getAll, getById, create, update, remove } from "../controllers/tipo.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

export const tipoRouter = Router();
tipoRouter.get("/", authenticate, getAll);
tipoRouter.get("/:id", authenticate, getById);
tipoRouter.post("/", authenticate, create);
tipoRouter.put("/:id", authenticate, update);
tipoRouter.delete("/:id", authenticate, remove);
