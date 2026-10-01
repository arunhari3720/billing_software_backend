import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";
export async function requireAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : null;
    if (!token)
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).populate("agency");
    if (!user || !user.active)
      return res
        .status(401)
        .json({ success: false, message: "Account inactive or invalid" });
    req.user = user;
    next();
  } catch (e) {
    next(
      Object.assign(new Error("Invalid or expired session"), { status: 401 }),
    );
  }
}
export const allowRoles =
  (...roles) =>
  (req, res, next) =>
    roles.includes(req.user.role)
      ? next()
      : res
          .status(403)
          .json({ success: false, message: "Insufficient permissions" });
export const agencyScope = (req, res, next) => {
  if (!["ADMIN", "USER"].includes(req.user.role))
    return res
      .status(403)
      .json({ success: false, message: "Agency access required" });
  req.agencyId = req.user.agency._id;
  next();
};
