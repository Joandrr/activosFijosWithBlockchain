import { Router } from "express";
import { getAll, create } from "../controllers/detalle_estado_activo.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

export const detalleEstadoActivoRouter = Router();
detalleEstadoActivoRouter.get("/", authenticate, getAll);
detalleEstadoActivoRouter.post("/", authenticate, create);
