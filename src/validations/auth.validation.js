import {z} from "zod";
export const loginSchema=z.object({email:z.string().email(),password:z.string().min(6)});
export const registerSchema=z.object({
  agencyName:z.string().min(2),agencyCode:z.string().min(2).max(30),
  name:z.string().min(2),email:z.string().email(),password:z.string().min(6),
  phone:z.string().optional(),address:z.string().optional()
});
