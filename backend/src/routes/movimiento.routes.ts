import { Router } from "express";
import { getAll, getById, create, update, remove, signReceptor, signEmisor, getSummaryReport, getIndividualReport } from "../controllers/movimiento.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

export const movimientoRouter = Router();
movimientoRouter.get("/reporte", authenticate, getSummaryReport);
movimientoRouter.get("/", authenticate, getAll);
movimientoRouter.get("/:id", authenticate, getById);
movimientoRouter.get("/:id/reporte", authenticate, getIndividualReport);
movimientoRouter.post("/", authenticate, create);
movimientoRouter.put("/:id", authenticate, update);
movimientoRouter.delete("/:id", authenticate, remove);
movimientoRouter.post("/:id/sign-receptor", authenticate, signReceptor);
movimientoRouter.post("/:id/sign-emisor", authenticate, signEmisor);
