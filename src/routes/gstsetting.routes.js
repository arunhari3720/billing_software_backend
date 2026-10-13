import express from "express";
import {
  getGstSetting,
  updateGstSetting,
} from "../controllers/gst.controller.js";
import { requireAuth, agencyScope } from "../middlewares/auth.middleware.js";

const router = express.Router();
console.log("GST SETTING ROUTER LOADED");
router.get(
  "/get-gst",
  requireAuth,
   agencyScope,
  getGstSetting
);

router.patch(
  "/update-gst",
  requireAuth,
   agencyScope,
  updateGstSetting
);

export default router;