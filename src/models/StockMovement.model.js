import mongoose from "mongoose";
const schema=new mongoose.Schema({
  agency:{type:mongoose.Schema.Types.ObjectId,ref:"Agency",required:true,index:true},
  product:{type:mongoose.Schema.Types.ObjectId,ref:"Product",required:true,index:true},
  type:{type:String,enum:["IN","OUT","ADJUSTMENT"],required:true},
  qty:{type:Number,required:true},
  beforeQty:{type:Number,required:true},
  afterQty:{type:Number,required:true},
  referenceType:{type:String,enum:["BILL","MANUAL","RETURN"],default:"MANUAL"},
  referenceId:{type:mongoose.Schema.Types.ObjectId,default:null},
  createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true}
},{timestamps:true});
schema.index({agency:1,createdAt:-1});
export const StockMovement=mongoose.model("StockMovement",schema);
