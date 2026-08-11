import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import { getAuditLogs, getBusinessAuditLogs } from "../services/audit.service";

export async function getPlatformLogs(req: AuthenticatedRequest, res: Response) {
  try {
    // Only SUPER_ADMIN can view platform-wide audit logs
    if (req.user?.role !== "SUPER_ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Super Admin access required to view platform audit logs",
      });
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;

    const result = await getAuditLogs({
      businessId: req.query.businessId ? String(req.query.businessId) : undefined,
      userId: req.query.userId ? String(req.query.userId) : undefined,
      action: req.query.action as any,
      entityType: req.query.entityType ? String(req.query.entityType) : undefined,
      dateFrom: req.query.dateFrom ? String(req.query.dateFrom) : undefined,
      dateTo: req.query.dateTo ? String(req.query.dateTo) : undefined,
      page,
      limit,
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to fetch audit logs" });
  }
}

export async function getBusinessLogs(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.businessId) {
      return res.status(403).json({
        success: false,
        message: "Business context required",
      });
    }

    // BUSINESS_ADMIN can view their business logs
    if (req.user.role !== "BUSINESS_ADMIN" && req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Business Admin access required to view audit logs",
      });
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;

    const result = await getBusinessAuditLogs(req.user.businessId, page, limit);

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to fetch audit logs" });
  }
}

export async function getMyLogs(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;

    const result = await getAuditLogs({
      userId: req.user.userId,
      businessId: req.user.businessId,
      page,
      limit,
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to fetch audit logs" });
  }
}
