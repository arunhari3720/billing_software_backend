import {Router} from "express";
import {listUsers,createUser,updateUser,deleteUser} from "../controllers/user.controller.js";
import {requireAuth,agencyScope,allowRoles} from "../middlewares/auth.middleware.js";
import {validate} from "../middlewares/validate.middleware.js";
import {createUserSchema} from "../validations/user.validation.js";
const r=Router(); r.use(requireAuth,agencyScope);
r.get("/",listUsers); r.post("/",allowRoles("ADMIN"),validate(createUserSchema),createUser);
r.patch("/:id",allowRoles("ADMIN"),updateUser); r.delete("/:id",allowRoles("ADMIN"),deleteUser);
export default r;
