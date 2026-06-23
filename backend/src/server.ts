import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { router } from "./routes/index.js";
import notificationRoutes from './routes/notification.routes.js';

const app = express();
app.set("trust proxy", true);

app.use(cors());
app.use(express.json());

// Prevent browser caching of dynamic API responses
app.use((_req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

app.use("/api", router);

app.use(
  '/api/notifications',
  notificationRoutes,
);

app.get("/health", (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.listen(env.PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${env.PORT}`);
});

export default app;
