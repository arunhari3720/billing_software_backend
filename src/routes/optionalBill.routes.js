import {Router} from "express";
import {listOptionalBills,createOptionalBillController} from "../controllers/optionalBill.controller.js";
import {requireAuth,agencyScope} from "../middlewares/auth.middleware.js";
import {validate} from "../middlewares/validate.middleware.js";
import {optionalBillSchema} from "../validations/bill.validation.js";
const r=Router();r.use(requireAuth,agencyScope);
r.get("/",listOptionalBills);r.post("/",validate(optionalBillSchema),createOptionalBillController);
export default r;
