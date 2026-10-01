import {Router} from "express";
import {listProducts,createProduct,updateProduct,deleteProduct} from "../controllers/product.controller.js";
import {requireAuth,agencyScope} from "../middlewares/auth.middleware.js";
import {validate} from "../middlewares/validate.middleware.js";
import {productSchema} from "../validations/product.validation.js";
const r=Router();r.use(requireAuth,agencyScope);
r.get("/",listProducts);r.post("/",validate(productSchema),createProduct);r.patch("/:id",updateProduct);r.delete("/:id",deleteProduct);
export default r;
