"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listMovements = listMovements;
const product_service_1 = require("../services/product.service");
async function listMovements(req, res) {
    try {
        if (!req.user?.businessId) {
            return res.status(403).json({ success: false, message: "Business context required" });
        }
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 50;
        const result = await (0, product_service_1.getStockMovements)({
            businessId: req.user.businessId,
            search: req.query.search ? String(req.query.search) : undefined,
            productId: req.query.productId ? String(req.query.productId) : undefined,
            movementType: req.query.movementType
                ? String(req.query.movementType)
                : undefined,
            dateFrom: req.query.dateFrom ? String(req.query.dateFrom) : undefined,
            dateTo: req.query.dateTo ? String(req.query.dateTo) : undefined,
            referenceId: req.query.referenceId ? String(req.query.referenceId) : undefined,
            createdById: req.query.createdById ? String(req.query.createdById) : undefined,
            page,
            limit,
        });
        return res.status(200).json({ success: true, data: result });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Failed to fetch inventory movements" });
    }
}
//# sourceMappingURL=inventory.controller.js.map