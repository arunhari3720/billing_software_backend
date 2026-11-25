
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
import gstSettingRoutes from "./routes/gstsetting.routes.js";
import productOptionRoutes from "./routes/productoption.routes.js";

const app = express();

app.set("trust proxy", 1);

// Security
app.use(helmet());

// CORS
const allowedOrigins = (
  process.env.CLIENT_URL ||
  "https://billforge.netlify.app"
)
  .split(",")
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
    optionsSuccessStatus: 204,
  })
);

// Body parsers
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Logging
app.use(morgan("dev"));

// Rate limiting
app.use(
  rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 900000),
    limit: Number(process.env.RATE_LIMIT_MAX || 300),
    standardHeaders: "draft-7",
    legacyHeaders: false,
  })
);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: "billforge-api",
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/agencies", agencyRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/optional-bills", optionalBillRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/gst-settings", gstSettingRoutes);
app.use("/api/product-options", productOptionRoutes);

// Error handlers — keep these last
app.use(notFound);
app.use(errorHandler);

// Start server only after database connection
const PORT = Number(process.env.PORT || 5000);

connectDatabase()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`BillForge API listening on port ${PORT}`);
      console.log("Allowed CORS origins:", allowedOrigins);
    });
  })
  .catch((error) => {
    console.error("Failed to start BillForge API:", error);
    process.exit(1);
  });

export default app;