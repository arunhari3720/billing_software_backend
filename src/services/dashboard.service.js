import {Product} from "../models/Product.model.js";
import {Store} from "../models/Store.model.js";
import {User} from "../models/User.model.js";
import {Bill} from "../models/Bill.model.js";
export async function agencyDashboard(agencyId){
 const [products,storeCount,userCount,bills]=await Promise.all([
  Product.find({agency:agencyId,active:true}).select("name stockQty price gstRate lowStockThreshold"),
  Store.countDocuments({agency:agencyId,active:true}),
  User.countDocuments({agency:agencyId,active:true}),
  Bill.find({agency:agencyId}).populate("createdBy","name").populate("store","name").sort({createdAt:-1}).limit(200)
 ]);
 const totalStock=products.reduce((s,p)=>s+p.stockQty,0);
 const stockValue=products.reduce((s,p)=>s+p.stockQty*p.price,0);
 const totalBilled=bills.reduce((s,b)=>s+b.grandTotal,0);
 const byUser={}; for(const b of bills){const k=b.createdBy?.name||"Unknown";byUser[k]=(byUser[k]||0)+b.grandTotal}
 return {productCount:products.length,storeCount,userCount,billCount:bills.length,totalStock,stockValue,totalBilled,lowStock:products.filter(p=>p.stockQty<=p.lowStockThreshold).length,recentBills:bills.slice(0,10),byUser};
}
