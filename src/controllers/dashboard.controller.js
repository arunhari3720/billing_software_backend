import {agencyDashboard} from "../services/dashboard.service.js";
import {Agency} from "../models/Agency.model.js";
import {User} from "../models/User.model.js";
export async function agencyDashboardController(req,res,next){try{res.json({success:true,data:await agencyDashboard(req.agencyId)})}catch(e){next(e)}}
export async function masterDashboardController(req,res,next){try{const [agencies,users]=await Promise.all([Agency.countDocuments(),User.countDocuments()]);res.json({success:true,data:{agencies,users}})}catch(e){next(e)}}
