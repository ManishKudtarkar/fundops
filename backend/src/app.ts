import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import customerRoutes from "./routes/customer.routes";
import productRoutes from "./routes/product.routes";
import challanRoutes from "./routes/challan.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import inventoryRoutes from "./routes/inventory.routes";
import businessRoutes from "./routes/business.routes";
import employeeRoutes from "./routes/employee.routes";
import followupRoutes from "./routes/followup.routes";
import auditRoutes from "./routes/audit.routes";

const app = express();

app.use(cors());
app.use(express.json());

// Add logging middleware
app.use((req, res, next) => {
  console.log(`\n📍 ${req.method} ${req.path}`);
  next();
});

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "FundOps ERP API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/challans", challanRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/businesses", businessRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/followups", followupRoutes);
app.use("/api/audit", auditRoutes);

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("🔴 GLOBAL ERROR:", err);
  res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

export default app;