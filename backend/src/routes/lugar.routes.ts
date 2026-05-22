import { Router } from "express";
import { getAll, getById, create, update, remove } from "../controllers/lugar.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

export const lugarRouter = Router();
lugarRouter.get("/", authenticate, getAll);
lugarRouter.get("/:id", authenticate, getById);
lugarRouter.post("/", authenticate, create);
lugarRouter.put("/:id", authenticate, update);
lugarRouter.delete("/:id", authenticate, remove);
