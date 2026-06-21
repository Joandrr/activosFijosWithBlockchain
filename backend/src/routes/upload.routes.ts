import { Router } from "express";
import multer from "multer";
import { uploadImage, serveImage } from "../controllers/upload.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // limit file size to 5MB
  },
});

export const uploadRouter = Router();

uploadRouter.post("/", authenticate, upload.single("image"), uploadImage);
uploadRouter.get("/image/:key*", serveImage);
