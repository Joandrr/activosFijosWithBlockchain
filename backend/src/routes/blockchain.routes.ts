import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  getContracts,
  getContractById,
  verifyContract,
  getSignatures,
  getAuditLogs,
} from "../controllers/blockchain.controller.js";

export const blockchainRouter = Router();

// Protect all proxy routes with JWT authentication
blockchainRouter.get("/contracts", authenticate, getContracts);
blockchainRouter.get("/contracts/:id", authenticate, getContractById);
blockchainRouter.get("/contracts/:id/verify", authenticate, verifyContract);
blockchainRouter.get("/contracts/:id/signatures", authenticate, getSignatures);
blockchainRouter.get("/contracts/:id/audit", authenticate, getAuditLogs);
