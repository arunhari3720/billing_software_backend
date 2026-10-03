import { Router } from "express";

import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";

import {
  requireAuth,
  agencyScope,
} from "../middlewares/auth.middleware.js";

import { validate } from "../middlewares/validate.middleware.js";
import { productSchema } from "../validations/product.validation.js";

const r = Router();

r.use(requireAuth, agencyScope);

// Get all products
r.get("/get-products", listProducts);

// Get single product
r.get("/get-product/:id", getProduct);

// Create product
r.post(
  "/create-product",
  validate(productSchema),
  createProduct
);

// Update product
r.patch(
  "/update-product/:id",
  updateProduct
);

// Delete product
r.delete(
  "/delete-product/:id",
  deleteProduct
);

export default r;