import {Store} from "../models/Store.model.js";
export async function listStores(req,res,next){try{res.json({success:true,data:await Store.find({agency:req.agencyId,active:true}).sort({name:1})})}catch(e){next(e)}}
export async function createStore(req,res,next){try{const s=await Store.create({...req.body,agency:req.agencyId});res.status(201).json({success:true,data:s})}catch(e){next(e)}}
export async function updateStore(req,res,next){try{const s=await Store.findOneAndUpdate({_id:req.params.id,agency:req.agencyId},{$set:req.body},{new:true});res.json({success:true,data:s})}catch(e){next(e)}}
export async function deleteStore(req,res,next){try{await Store.findOneAndUpdate({_id:req.params.id,agency:req.agencyId},{$set:{active:false}});res.json({success:true})}catch(e){next(e)}}
