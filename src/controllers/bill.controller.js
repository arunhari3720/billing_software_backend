import { Bill } from "../models/Bill.model.js";
import { createBill } from "../services/bill.service.js";
export async function listBills(req, res, next) {
  try {
    const data = await Bill.find({ agency: req.agencyId })
      .populate("createdBy", "name")
      .populate("store", "name")
      .sort({ createdAt: -1 })
      .limit(300);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}
export async function getBill(req, res, next) {
  try {
    const b = await Bill.findOne({ _id: req.params.id, agency: req.agencyId })
      .populate("createdBy", "name")
      .populate("store", "name");
    if (!b)
      return res
        .status(404)
        .json({ success: false, message: "Bill not found" });
    res.json({ success: true, data: b });
  } catch (e) {
    next(e);
  }
}
export async function createBillController(req, res, next) {
  try {
    res
      .status(201)
      .json({
        success: true,
        data: await createBill({
          agencyId: req.agencyId,
          userId: req.user._id,
          data: req.body,
        }),
      });
  } catch (e) {
    next(e);
  }
}
