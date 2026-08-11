"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboard = getDashboard;
const dashboard_service_1 = require("../services/dashboard.service");
async function getDashboard(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Authentication required" });
        }
        // SUPER_ADMIN gets the platform dashboard
        if (req.user.role === "SUPER_ADMIN") {
            const data = await (0, dashboard_service_1.getPlatformDashboardMetrics)();
            return res.status(200).json({ success: true, data });
        }
        // All other roles get their business-scoped dashboard
        if (!req.user.businessId) {
            return res.status(403).json({ success: false, message: "Business context required" });
        }
        const data = await (0, dashboard_service_1.getBusinessDashboardMetrics)(req.user.businessId);
        return res.status(200).json({ success: true, data });
    }
    catch (error) {
        console.error("Dashboard error:", error);
        return res.status(500).json({ success: false, message: "Failed to load dashboard metrics" });
    }
}
exports.default = { getDashboard };
//# sourceMappingURL=dashboard.controller.js.map