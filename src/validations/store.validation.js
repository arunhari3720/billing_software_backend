import {z} from "zod";
export const storeSchema=z.object({name:z.string().min(1),code:z.string().optional(),phone:z.string().optional(),address:z.string().optional()});
