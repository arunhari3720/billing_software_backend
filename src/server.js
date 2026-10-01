import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { connectDatabase } from "./database/connect.js";
import { notFound, errorHandler } from "./middlewares/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import agencyRoutes from "./routes/agency.routes.js";
import userRoutes from "./routes/user.routes.js";
import productRoutes from "./routes/product.routes.js";
import storeRoutes from "./routes/store.routes.js";
import billRoutes from "./routes/bill.routes.js";
import optionalBillRoutes from "./routes/optionalBill.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import stockRoutes from "./routes/stock.routes.js";

const app=express();
app.set("trust proxy",1);
app.use(helmet());
app.use(cors({origin:process.env.CLIENT_URL?.split(",")||["http://localhost:5173"],credentials:true}));
app.use(express.json({limit:"1mb"}));
app.use(express.urlencoded({extended:true,limit:"1mb"}));
app.use(morgan("dev"));
app.use(rateLimit({
  windowMs:Number(process.env.RATE_LIMIT_WINDOW_MS||900000),
  limit:Number(process.env.RATE_LIMIT_MAX||300),
  standardHeaders:"draft-7",
  legacyHeaders:false
}));

app.get("/api/health",(_,res)=>res.json({success:true,service:"billforge-api",timestamp:new Date().toISOString()}));
app.use("/api/auth",authRoutes);
app.use("/api/agencies",agencyRoutes);
app.use("/api/users",userRoutes);
app.use("/api/products",productRoutes);
app.use("/api/stores",storeRoutes);
app.use("/api/bills",billRoutes);
app.use("/api/optional-bills",optionalBillRoutes);
app.use("/api/dashboard",dashboardRoutes);
app.use("/api/stock",stockRoutes);

app.use(notFound);
app.use(errorHandler);

const port=Number(process.env.PORT||5000);
connectDatabase().then(()=>app.listen(port,()=>console.log(`BillForge API listening on ${port}`)));
