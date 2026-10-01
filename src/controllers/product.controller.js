import {Product} from "../models/Product.model.js";
export async function listProducts(req,res,next){try{res.json({success:true,data:await Product.find({agency:req.agencyId,active:true}).sort({name:1})})}catch(e){next(e)}}
export async function createProduct(req,res,next){try{const p=await Product.create({...req.body,agency:req.agencyId});res.status(201).json({success:true,data:p})}catch(e){next(e)}}
export async function updateProduct(req,res,next){try{const p=await Product.findOneAndUpdate({_id:req.params.id,agency:req.agencyId},{$set:req.body},{new:true});res.json({success:true,data:p})}catch(e){next(e)}}
export async function deleteProduct(req,res,next){try{await Product.findOneAndUpdate({_id:req.params.id,agency:req.agencyId},{$set:{active:false}});res.json({success:true})}catch(e){next(e)}}
