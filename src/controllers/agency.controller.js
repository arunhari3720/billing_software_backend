import {Agency} from "../models/Agency.model.js";
import {User} from "../models/User.model.js";
import bcrypt from "bcryptjs";
export async function listAgencies(req,res,next){try{res.json({success:true,data:await Agency.find().sort({createdAt:-1})})}catch(e){next(e)}}
export async function createAgency(req,res,next){
 try{
  const {name,code,phone,address,adminName,adminEmail,adminPassword}=req.body;
  if(await Agency.exists({code:code.toUpperCase()})) throw Object.assign(new Error("Agency code exists"),{status:409});
  const agency=await Agency.create({name,code,phone,address});
  await User.create({name:adminName,email:adminEmail,password:await bcrypt.hash(adminPassword,12),role:"ADMIN",agency:agency._id});
  res.status(201).json({success:true,data:agency});
 }catch(e){next(e)}
}
export async function toggleAgency(req,res,next){try{const a=await Agency.findByIdAndUpdate(req.params.id,{active:req.body.active},{new:true});res.json({success:true,data:a})}catch(e){next(e)}}
