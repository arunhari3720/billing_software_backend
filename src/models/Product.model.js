import mongoose from "mongoose";
const schema=new mongoose.Schema({
  agency:{type:mongoose.Schema.Types.ObjectId,ref:"Agency",required:true,index:true},
  name:{type:String,required:true,trim:true,maxLength:160},
  sku:{type:String,trim:true,maxLength:60},
  category:{type:String,trim:true,maxLength:80},
  price:{type:Number,required:true,min:0},
  stockQty:{type:Number,required:true,min:0,default:0},
  gstRate:{type:Number,required:true,min:0,max:100,default:0},
  lowStockThreshold:{type:Number,min:0,default:5},
  active:{type:Boolean,default:true}
},{timestamps:true});
schema.index({agency:1,sku:1});
schema.index({agency:1,active:1});
export const Product=mongoose.model("Product",schema);
