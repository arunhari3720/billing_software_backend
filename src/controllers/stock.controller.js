import {Product} from "../models/Product.model.js";
import {StockMovement} from "../models/StockMovement.model.js";
export async function stockSummary(req,res,next){try{
 const [products,movements]=await Promise.all([
  Product.find({agency:req.agencyId,active:true}).sort({name:1}),
  StockMovement.find({agency:req.agencyId}).populate("product","name sku").populate("createdBy","name").sort({createdAt:-1}).limit(200)
 ]);
 res.json({success:true,data:{products,movements,totalUnits:products.reduce((s,p)=>s+p.stockQty,0),stockValue:products.reduce((s,p)=>s+p.stockQty*p.price,0)}});
}catch(e){next(e)}}
