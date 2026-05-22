import { Router } from "express";
import { getAll, create, remove } from "../controllers/responsable_lugar.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

export const responsableLugarRouter = Router();
responsableLugarRouter.get("/", authenticate, getAll);
responsableLugarRouter.post("/", authenticate, create);
responsableLugarRouter.delete("/:id", authenticate, remove);
