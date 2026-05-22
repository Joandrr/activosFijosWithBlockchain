import { Router } from "express";
import { getAll, getById, create, update, remove } from "../controllers/activo.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

export const activoRouter = Router();
activoRouter.get("/", authenticate, getAll);
activoRouter.get("/:id", authenticate, getById);
activoRouter.post("/", authenticate, create);
activoRouter.put("/:id", authenticate, update);
activoRouter.delete("/:id", authenticate, remove);
