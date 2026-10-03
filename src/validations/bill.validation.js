import { z } from "zod";

export const billSchema = z.object({
  storeId: z.string().min(1, "Store is required"),

  customerName: z.string().optional().default(""),

  customerPhone: z.string().optional().default(""),

  paymentMethod: z.enum(["CASH", "UPI", "CARD", "CREDIT"]).default("CASH"),

  items: z
    .array(
      z.object({
        productId: z.string().min(1, "Product is required"),

        qty: z.coerce.number().positive("Quantity must be greater than 0"),
      }),
    )
    .min(1, "Bill must contain at least one item"),
});
export const optionalBillSchema = z.object({
  storeId: z.string().min(1),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  paymentMethod: z.enum(["CASH", "UPI", "CARD", "CREDIT"]).default("CASH"),
  items: z
    .array(
      z.object({
        name: z.string().min(1),
        sku: z.string().optional(),
        qty: z.coerce.number().positive(),
        price: z.coerce.number().min(0),
        gstRate: z.coerce.number().min(0).max(100),
      }),
    )
    .min(1),
});
