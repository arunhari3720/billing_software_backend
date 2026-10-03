import { Router } from "express";

import {
  listBills,
  getBill,
  createBillController,
  profitReport,
} from "../controllers/bill.controller.js";

import {
  requireAuth,
  agencyScope,
} from "../middlewares/auth.middleware.js";

import { validate } from "../middlewares/validate.middleware.js";

import { billSchema } from "../validations/bill.validation.js";

const r = Router();

r.use(requireAuth, agencyScope);

// Bills
r.get("/get-bills", listBills);

r.get("/get-bill/:id", getBill);

r.post(
  "/create-bill",
  validate(billSchema),
  createBillController
);

// Profit reports
r.get(
  "/get-profit-report",
  profitReport
);

export default r;