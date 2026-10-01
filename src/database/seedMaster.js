import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDatabase } from "./connect.js";
import { User } from "../models/User.model.js";

await connectDatabase();
const password=await bcrypt.hash("Master@123",12);
await User.findOneAndUpdate(
  {email:"master@billforge.local"},
  {name:"System Master",email:"master@billforge.local",password,role:"MASTER",agency:null,active:true},
  {upsert:true,new:true,setDefaultsOnInsert:true}
);
console.log("Master: master@billforge.local / Master@123");
await mongoose.disconnect();
