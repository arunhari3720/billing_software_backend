import mongoose from "mongoose";
import {Bill} from "../models/Bill.model.js";
import {Product} from "../models/Product.model.js";
import {Store} from "../models/Store.model.js";
import {roundMoney} from "../utils/money.js";
import {makeBillNumber} from "../utils/billNumber.js";
import {reduceStock} from "./stock.service.js";

export async function createBill({agencyId,userId,data}){
 const session=await mongoose.startSession();
 try{
  session.startTransaction();
  const store=await Store.findOne({_id:data.storeId,agency:agencyId,active:true}).session(session);
  if(!store) throw Object.assign(new Error("Invalid store"),{status:400});
  const ids=data.items.map(x=>x.productId);
  const products=await Product.find({_id:{$in:ids},agency:agencyId,active:true}).session(session);
  const map=new Map(products.map(p=>[p._id.toString(),p]));
  const billItems=[]; let subtotal=0,gstTotal=0;
  for(const line of data.items){
   const p=map.get(line.productId);
   if(!p) throw Object.assign(new Error("Invalid product"),{status:400});
   const taxable=roundMoney(p.price*line.qty);
   const gst=roundMoney(taxable*p.gstRate/100);
   const total=roundMoney(taxable+gst);
   subtotal+=taxable; gstTotal+=gst;
   billItems.push({product:p._id,name:p.name,sku:p.sku,qty:line.qty,price:p.price,gstRate:p.gstRate,taxable,gst,total});
  }
  const bill=await Bill.create([{
   billNo:makeBillNumber("BILL"),agency:agencyId,store:store._id,createdBy:userId,
   customerName:data.customerName,customerPhone:data.customerPhone,paymentMethod:data.paymentMethod,
   items:billItems,subtotal:roundMoney(subtotal),gstTotal:roundMoney(gstTotal),grandTotal:roundMoney(subtotal+gstTotal)
  }],{session});
  for(const line of billItems){
   const p=map.get(line.product.toString());
   const updated=await Product.findOneAndUpdate({_id:p._id,agency:agencyId,active:true,stockQty:{$gte:line.qty}},{$inc:{stockQty:-line.qty}},{new:true,session});
   if(!updated) throw Object.assign(new Error(`${p.name}: insufficient stock`),{status:400});
  }
  await session.commitTransaction();
  return Bill.findById(bill[0]._id).populate("store","name").populate("createdBy","name");
 }catch(e){await session.abortTransaction();throw e}finally{session.endSession()}
}
