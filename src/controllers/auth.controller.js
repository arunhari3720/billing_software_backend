import {login,registerAgency,safeUser} from "../services/auth.service.js";
import {User} from "../models/User.model.js";
export async function loginController(req,res,next){try{res.json({success:true,...await login(req.body)})}catch(e){next(e)}}
export async function registerController(req,res,next){try{res.status(201).json({success:true,...await registerAgency(req.body)})}catch(e){next(e)}}
export async function meController(req,res){const user=await User.findById(req.user._id).populate("agency");res.json({success:true,user:safeUser(user)})}
