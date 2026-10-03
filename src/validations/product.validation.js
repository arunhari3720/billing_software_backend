import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(
    1,
    "Product name is required",
  ),

  brand: z
    .string()
    .optional()
    .default(""),

  sku: z
    .string()
    .optional()
    .default(""),

  category: z
    .string()
    .optional()
    .default(""),

  rawPrice: z.coerce
    .number()
    .min(
      0,
      "Raw price cannot be negative",
    ),

  gstRate: z.coerce
    .number()
    .min(0)
    .max(100),

  marginPercentage: z.coerce
    .number()
    .min(0)
    .max(1000),

  stockQty: z.coerce
    .number()
    .min(0),

  lowStockThreshold: z.coerce
    .number()
    .min(0)
    .default(5),
});