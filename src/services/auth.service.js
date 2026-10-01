import bcrypt from "bcryptjs";
import {Agency} from "../models/Agency.model.js";
import {User} from "../models/User.model.js";
import {signToken} from "../utils/jwt.js";

export async function login({email,password}){
 const user=await User.findOne({email:email.toLowerCase()}).select("+password").populate("agency");
 if(!user||!await bcrypt.compare(password,user.password)) throw Object.assign(new Error("Invalid email or password"),{status:401});
 return {token:signToken(user),user:safeUser(user)};
}
export async function registerAgency(data){
 if(await Agency.exists({code:data.agencyCode.toUpperCase()})) throw Object.assign(new Error("Agency code already exists"),{status:409});
 if(await User.exists({email:data.email.toLowerCase()})) throw Object.assign(new Error("Email already registered"),{status:409});
 const agency=await Agency.create({name:data.agencyName,code:data.agencyCode,phone:data.phone,address:data.address});
 const password=await bcrypt.hash(data.password,12);
 const user=await User.create({name:data.name,email:data.email,password,role:"ADMIN",agency:agency._id});
 await user.populate("agency");
 return {token:signToken(user),user:safeUser(user)};
}
export function safeUser(u){return {id:u._id,name:u.name,email:u.email,role:u.role,agency:u.agency||null,active:u.active}}
