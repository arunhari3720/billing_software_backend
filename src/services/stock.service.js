import {Product} from "../models/Product.model.js";
import {StockMovement} from "../models/StockMovement.model.js";

export async function reduceStock({agencyId,product,qty,userId,referenceId}){
 const updated=await Product.findOneAndUpdate(
  {_id:product._id,agency:agencyId,active:true,stockQty:{$gte:qty}},
  {$inc:{stockQty:-qty}},
  {new:true}
 );
 if(!updated) throw Object.assign(new Error(`${product.name}: insufficient stock`),{status:400});
 await StockMovement.create({
  agency:agencyId,product:product._id,type:"OUT",qty,
  beforeQty:updated.stockQty+qty,afterQty:updated.stockQty,
  referenceType:"BILL",referenceId,createdBy:userId
 });
 return updated;
}
