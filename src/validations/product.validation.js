import {z} from "zod";
export const productSchema=z.object({
 name:z.string().min(1),sku:z.string().optional(),category:z.string().optional(),
 price:z.coerce.number().min(0),stockQty:z.coerce.number().min(0),
 gstRate:z.coerce.number().min(0).max(100),lowStockThreshold:z.coerce.number().min(0).default(5)
});
