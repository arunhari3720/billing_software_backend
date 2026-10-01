import mongoose from "mongoose";
const schema=new mongoose.Schema({
  name:{type:String,required:true,trim:true,maxLength:120},
  code:{type:String,required:true,unique:true,uppercase:true,trim:true,maxLength:30},
  phone:{type:String,trim:true},
  address:{type:String,trim:true,maxLength:500},
  active:{type:Boolean,default:true}
},{timestamps:true});
schema.index({code:1},{unique:true});
export const Agency=mongoose.model("Agency",schema);
