import { Router } from "express";
import { getAll, create, remove } from "../controllers/estado_activo.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

export const estadoActivoRouter = Router();
estadoActivoRouter.get("/", authenticate, getAll);
estadoActivoRouter.post("/", authenticate, create);
estadoActivoRouter.delete("/:id", authenticate, remove);
