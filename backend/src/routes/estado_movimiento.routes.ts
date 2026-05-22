import { Router } from "express";
import { getAll, create, remove } from "../controllers/estado_movimiento.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

export const estadoMovimientoRouter = Router();
estadoMovimientoRouter.get("/", authenticate, getAll);
estadoMovimientoRouter.post("/", authenticate, create);
estadoMovimientoRouter.delete("/:id", authenticate, remove);
