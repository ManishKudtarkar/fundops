"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlatformLogs = getPlatformLogs;
exports.getBusinessLogs = getBusinessLogs;
exports.getMyLogs = getMyLogs;
const audit_service_1 = require("../services/audit.service");
async function getPlatformLogs(req, res) {
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
        const result = await (0, audit_service_1.getAuditLogs)({
            businessId: req.query.businessId ? String(req.query.businessId) : undefined,
            userId: req.query.userId ? String(req.query.userId) : undefined,
            action: req.query.action,
            entityType: req.query.entityType ? String(req.query.entityType) : undefined,
            dateFrom: req.query.dateFrom ? String(req.query.dateFrom) : undefined,
            dateTo: req.query.dateTo ? String(req.query.dateTo) : undefined,
            page,
            limit,
        });
        return res.status(200).json({ success: true, data: result });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Failed to fetch audit logs" });
    }
}
async function getBusinessLogs(req, res) {
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
        const result = await (0, audit_service_1.getBusinessAuditLogs)(req.user.businessId, page, limit);
        return res.status(200).json({ success: true, data: result });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Failed to fetch audit logs" });
    }
}
async function getMyLogs(req, res) {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({ success: false, message: "Authentication required" });
        }
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 50;
        const result = await (0, audit_service_1.getAuditLogs)({
            userId: req.user.userId,
            businessId: req.user.businessId,
            page,
            limit,
        });
        return res.status(200).json({ success: true, data: result });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Failed to fetch audit logs" });
    }
}
//# sourceMappingURL=audit.controller.js.map