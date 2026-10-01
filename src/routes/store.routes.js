import {Router} from "express";
import {listStores,createStore,updateStore,deleteStore} from "../controllers/store.controller.js";
import {requireAuth,agencyScope} from "../middlewares/auth.middleware.js";
import {validate} from "../middlewares/validate.middleware.js";
import {storeSchema} from "../validations/store.validation.js";
const r=Router();r.use(requireAuth,agencyScope);
r.get("/",listStores);r.post("/",validate(storeSchema),createStore);r.patch("/:id",updateStore);r.delete("/:id",deleteStore);
export default r;
