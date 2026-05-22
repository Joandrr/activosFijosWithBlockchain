import { Router } from "express";
import { getAll, getById, create, update, remove } from "../controllers/rol.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

export const rolRouter = Router();
rolRouter.get("/", authenticate, getAll);
rolRouter.get("/:id", authenticate, getById);
rolRouter.post("/", authenticate, authorize(1), create);
rolRouter.put("/:id", authenticate, authorize(1), update);
rolRouter.delete("/:id", authenticate, authorize(1), remove);
