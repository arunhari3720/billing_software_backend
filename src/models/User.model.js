import mongoose from "mongoose";
const schema=new mongoose.Schema({
  name:{type:String,required:true,trim:true,maxLength:100},
  email:{type:String,required:true,unique:true,lowercase:true,trim:true,index:true},
  password:{type:String,required:true,select:false},
  role:{type:String,enum:["MASTER","ADMIN","USER"],required:true},
  agency:{type:mongoose.Schema.Types.ObjectId,ref:"Agency",default:null,index:true},
  active:{type:Boolean,default:true}
},{timestamps:true});
schema.index({agency:1,active:1});
export const User=mongoose.model("User",schema);
