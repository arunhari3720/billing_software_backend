import { Router } from "express";

import {
  stockSummary,
} from "../controllers/stock.controller.js";

import {
  requireAuth,
  agencyScope,
} from "../middlewares/auth.middleware.js";

const r = Router();

r.use(requireAuth, agencyScope);

// Get stock summary
r.get(
  "/get-stock-summary",
  stockSummary
);

export default r;