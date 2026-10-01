import mongoose from "mongoose";
const schema=new mongoose.Schema({
  agency:{type:mongoose.Schema.Types.ObjectId,ref:"Agency",required:true,index:true},
  name:{type:String,required:true,trim:true,maxLength:120},
  code:{type:String,trim:true,maxLength:40},
  phone:{type:String,trim:true},
  address:{type:String,trim:true,maxLength:500},
  active:{type:Boolean,default:true}
},{timestamps:true});
schema.index({agency:1,name:1});
export const Store=mongoose.model("Store",schema);
