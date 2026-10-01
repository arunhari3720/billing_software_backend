import bcrypt from "bcryptjs";
import {User} from "../models/User.model.js";
export async function listUsers(req,res,next){try{res.json({success:true,data:await User.find({agency:req.agencyId}).select("-password").sort({createdAt:-1})})}catch(e){next(e)}}
export async function createUser(req,res,next){
 try{
  const count=await User.countDocuments({agency:req.agencyId});
  if(count>=5) throw Object.assign(new Error("Maximum 5 users per agency"),{status:400});
  const data=req.body;
  if(await User.exists({email:data.email.toLowerCase()})) throw Object.assign(new Error("Email already exists"),{status:409});
  const u=await User.create({name:data.name,email:data.email,password:await bcrypt.hash(data.password,12),role:data.role,agency:req.agencyId});
  res.status(201).json({success:true,data:{id:u._id,name:u.name,email:u.email,role:u.role,active:u.active}});
 }catch(e){next(e)}
}
export async function updateUser(req,res,next){try{const u=await User.findOneAndUpdate({_id:req.params.id,agency:req.agencyId},{$set:{name:req.body.name,active:req.body.active,role:req.body.role}},{new:true}).select("-password");res.json({success:true,data:u})}catch(e){next(e)}}
export async function deleteUser(req,res,next){try{if(req.params.id===req.user._id.toString())throw Object.assign(new Error("You cannot delete yourself"),{status:400});await User.deleteOne({_id:req.params.id,agency:req.agencyId});res.json({success:true})}catch(e){next(e)}}
