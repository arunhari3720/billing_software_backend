import {Router} from "express";
import {agencyDashboardController,masterDashboardController} from "../controllers/dashboard.controller.js";
import {requireAuth,agencyScope,allowRoles} from "../middlewares/auth.middleware.js";
const r=Router();
r.get("/master",requireAuth,allowRoles("MASTER"),masterDashboardController);
r.get("/agency",requireAuth,agencyScope,agencyDashboardController);
export default r;
