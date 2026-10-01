import { Router } from "express";
import {
  listBills,
  getBill,
  createBillController,
} from "../controllers/bill.controller.js";
import { requireAuth, agencyScope } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { billSchema } from "../validations/bill.validation.js";
const r = Router();
r.use(requireAuth, agencyScope);
r.get("/", listBills);
r.get("/:id", getBill);
r.post("/", validate(billSchema), createBillController);
export default r;
