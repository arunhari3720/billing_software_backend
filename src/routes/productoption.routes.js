import express from "express";

import {
  listProductOptions,
  createProductOption,
} from "../controllers/productoption.controller.js";

import {
  requireAuth,
  agencyScope,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get(
  "/getproducts",
  requireAuth,
  agencyScope,
  listProductOptions
);

router.post(
  "/createproducts",
  requireAuth,
  agencyScope,
  createProductOption
);

export default router;