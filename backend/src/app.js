"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const customer_routes_1 = __importDefault(require("./routes/customer.routes"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const challan_routes_1 = __importDefault(require("./routes/challan.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const inventory_routes_1 = __importDefault(require("./routes/inventory.routes"));
const business_routes_1 = __importDefault(require("./routes/business.routes"));
const employee_routes_1 = __importDefault(require("./routes/employee.routes"));
const followup_routes_1 = __importDefault(require("./routes/followup.routes"));
const audit_routes_1 = __importDefault(require("./routes/audit.routes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
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
app.use("/api/auth", auth_routes_1.default);
app.use("/api/customers", customer_routes_1.default);
app.use("/api/products", product_routes_1.default);
app.use("/api/challans", challan_routes_1.default);
app.use("/api/dashboard", dashboard_routes_1.default);
app.use("/api/inventory", inventory_routes_1.default);
app.use("/api/businesses", business_routes_1.default);
app.use("/api/employees", employee_routes_1.default);
app.use("/api/followups", followup_routes_1.default);
app.use("/api/audit", audit_routes_1.default);
// Global error handler
app.use((err, req, res, next) => {
    console.error("🔴 GLOBAL ERROR:", err);
    res.status(500).json({
        success: false,
        message: err.message || "Internal server error",
    });
});
exports.default = app;
//# sourceMappingURL=app.js.map