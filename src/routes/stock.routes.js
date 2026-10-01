import {Router} from "express";
import {stockSummary} from "../controllers/stock.controller.js";
import {requireAuth,agencyScope} from "../middlewares/auth.middleware.js";
const r=Router();r.get("/",requireAuth,agencyScope,stockSummary);export default r;
