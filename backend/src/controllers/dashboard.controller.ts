import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import { getBusinessDashboardMetrics, getPlatformDashboardMetrics } from "../services/dashboard.service";

export async function getDashboard(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    // SUPER_ADMIN gets the platform dashboard
    if (req.user.role === "SUPER_ADMIN") {
      const data = await getPlatformDashboardMetrics();
      return res.status(200).json({ success: true, data });
    }

    // All other roles get their business-scoped dashboard
    if (!req.user.businessId) {
      return res.status(403).json({ success: false, message: "Business context required" });
    }

    const data = await getBusinessDashboardMetrics(req.user.businessId);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Dashboard error:", error);
    return res.status(500).json({ success: false, message: "Failed to load dashboard metrics" });
  }
}

export default { getDashboard };
