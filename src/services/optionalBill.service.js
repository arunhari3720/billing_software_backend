import {OptionalBill} from "../models/OptionalBill.model.js";
import {Store} from "../models/Store.model.js";
import {roundMoney} from "../utils/money.js";
import {makeBillNumber} from "../utils/billNumber.js";
export async function createOptionalBill({agencyId,userId,data}){
 const store=await Store.findOne({_id:data.storeId,agency:agencyId,active:true});
 if(!store) throw Object.assign(new Error("Invalid store"),{status:400});
 let subtotal=0,gstTotal=0;
 const items=data.items.map(x=>{
  const taxable=roundMoney(x.price*x.qty),gst=roundMoney(taxable*x.gstRate/100),total=roundMoney(taxable+gst);
  subtotal+=taxable;gstTotal+=gst;
  return {...x,taxable,gst,total};
 });
 return OptionalBill.create({billNo:makeBillNumber("OPT"),agency:agencyId,store:store._id,createdBy:userId,customerName:data.customerName,customerPhone:data.customerPhone,paymentMethod:data.paymentMethod,items,subtotal:roundMoney(subtotal),gstTotal:roundMoney(gstTotal),grandTotal:roundMoney(subtotal+gstTotal)});
}
