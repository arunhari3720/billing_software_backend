import { z } from "zod";

export const gstSettingSchema = z.object({
  enabled: z.boolean().default(false),

  calculationMode: z.enum([
    "BEFORE_TAX",
    "AFTER_TAX",
  ]).default("BEFORE_TAX"),

  taxType: z.enum([
    "AUTO",
    "CGST_SGST",
    "IGST",
  ]).default("AUTO"),

  defaultGstRate: z.coerce
    .number()
    .min(0)
    .max(100)
    .default(18),

  sellerState: z
    .string()
    .trim()
    .optional()
    .default(""),
});