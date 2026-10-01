import mongoose from "mongoose";
const item=new mongoose.Schema({
  name:{type:String,required:true},sku:String,
  qty:{type:Number,required:true,min:0},
  price:{type:Number,required:true,min:0},
  gstRate:{type:Number,required:true,min:0,max:100},
  taxable:{type:Number,required:true,min:0},
  gst:{type:Number,required:true,min:0},
  total:{type:Number,required:true,min:0}
},{_id:false});
const schema=new mongoose.Schema({
  billNo:{type:String,required:true,index:true},
  agency:{type:mongoose.Schema.Types.ObjectId,ref:"Agency",required:true,index:true},
  store:{type:mongoose.Schema.Types.ObjectId,ref:"Store",required:true},
  createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
  customerName:String,customerPhone:String,
  items:{type:[item],required:true},
  subtotal:Number,gstTotal:Number,grandTotal:Number,
  paymentMethod:{type:String,enum:["CASH","UPI","CARD","CREDIT"],default:"CASH"}
},{timestamps:true});
schema.index({agency:1,createdAt:-1});
export const OptionalBill=mongoose.model("OptionalBill",schema);
