import { Router } from "express";
import { getAll, getById, create, update, remove } from "../controllers/marca.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

export const marcaRouter = Router();
marcaRouter.get("/", authenticate, getAll);
marcaRouter.get("/:id", authenticate, getById);
marcaRouter.post("/", authenticate, create);
marcaRouter.put("/:id", authenticate, update);
marcaRouter.delete("/:id", authenticate, remove);
