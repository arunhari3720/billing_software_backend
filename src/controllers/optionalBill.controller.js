import {OptionalBill} from "../models/OptionalBill.model.js";
import {createOptionalBill} from "../services/optionalBill.service.js";
export async function listOptionalBills(req,res,next){try{res.json({success:true,data:await OptionalBill.find({agency:req.agencyId}).populate("createdBy","name").populate("store","name").sort({createdAt:-1}).limit(300)})}catch(e){next(e)}}
export async function createOptionalBillController(req,res,next){try{res.status(201).json({success:true,data:await createOptionalBill({agencyId:req.agencyId,userId:req.user._id,data:req.body})})}catch(e){next(e)}}
