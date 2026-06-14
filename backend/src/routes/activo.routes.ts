import { Router } from "express";
import { getAll, getById, create, update, remove, getSummaryReport, getIndividualReport } from "../controllers/activo.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

export const activoRouter = Router();
activoRouter.get("/reporte", authenticate, getSummaryReport);
activoRouter.get("/", authenticate, getAll);
activoRouter.get("/:id", authenticate, getById);
activoRouter.get("/:id/reporte", authenticate, getIndividualReport);
activoRouter.post("/", authenticate, create);
activoRouter.put("/:id", authenticate, update);
activoRouter.delete("/:id", authenticate, remove);
