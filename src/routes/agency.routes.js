import {Router} from "express";
import {listAgencies,createAgency,toggleAgency} from "../controllers/agency.controller.js";
import {requireAuth,allowRoles} from "../middlewares/auth.middleware.js";
const r=Router(); r.use(requireAuth,allowRoles("MASTER"));
r.get("/",listAgencies); r.post("/",createAgency); r.patch("/:id/status",toggleAgency);
export default r;
