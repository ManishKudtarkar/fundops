"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = create;
exports.list = list;
exports.getById = getById;
exports.confirm = confirm;
exports.cancel = cancel;
exports.remove = remove;
const challan_validator_1 = require("../validators/challan.validator");
const challan_service_1 = require("../services/challan.service");
async function create(req, res) {
    try {
        if (!req.user?.businessId) {
            return res.status(403).json({ success: false, message: "Business context required" });
        }
        const validation = challan_validator_1.createChallanSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ success: false, message: "Validation failed", errors: validation.error.flatten() });
        }
        const challan = await (0, challan_service_1.createChallanAndClearCache)(req.user.businessId, validation.data.customerId, validation.data.items, req.user.userId);
        return res.status(201).json({ success: true, message: "Sales challan created successfully", data: challan });
    }
    catch (error) {
        console.error(error);
        if (error.message === "Customer not found") {
            return res.status(404).json({ success: false, message: "Resource not found" });
        }
        if (error.message.includes("product") || error.message.includes("Product")) {
            return res.status(400).json({ success: false, message: error.message });
        }
        return res.status(500).json({ success: false, message: "Failed to create sales challan" });
    }
}
async function list(req, res) {
    try {
        if (!req.user?.businessId) {
            return res.status(403).json({ success: false, message: "Business context required" });
        }
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const result = await (0, challan_service_1.getChallans)(req.user.businessId, page, limit);
        return res.status(200).json({ success: true, data: result });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Failed to fetch challans" });
    }
}
async function getById(req, res) {
    try {
        if (!req.user?.businessId) {
            return res.status(403).json({ success: false, message: "Business context required" });
        }
        const challan = await (0, challan_service_1.getChallanById)(req.params.id, req.user.businessId);
        if (!challan) {
            return res.status(404).json({ success: false, message: "Resource not found" });
        }
        return res.status(200).json({ success: true, data: challan });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Failed to fetch challan" });
    }
}
async function confirm(req, res) {
    try {
        if (!req.user?.businessId) {
            return res.status(403).json({ success: false, message: "Business context required" });
        }
        const challan = await (0, challan_service_1.confirmChallan)(req.params.id, req.user.businessId, req.user.userId);
        return res.status(200).json({ success: true, message: "Sales challan confirmed successfully", data: challan });
    }
    catch (error) {
        console.error(error);
        if (error.message === "Challan not found") {
            return res.status(404).json({ success: false, message: "Resource not found" });
        }
        if (error.message.includes("Only DRAFT") || error.message.includes("Insufficient stock") || error.message.includes("Product not found")) {
            return res.status(400).json({ success: false, message: error.message });
        }
        return res.status(500).json({ success: false, message: "Failed to confirm sales challan" });
    }
}
async function cancel(req, res) {
    try {
        if (!req.user?.businessId) {
            return res.status(403).json({ success: false, message: "Business context required" });
        }
        const challan = await (0, challan_service_1.cancelChallan)(req.params.id, req.user.businessId);
        return res.status(200).json({ success: true, message: "Sales challan cancelled successfully", data: challan });
    }
    catch (error) {
        console.error(error);
        if (error.message === "Challan not found") {
            return res.status(404).json({ success: false, message: "Resource not found" });
        }
        if (error.message.includes("Only DRAFT")) {
            return res.status(400).json({ success: false, message: error.message });
        }
        return res.status(500).json({ success: false, message: "Failed to cancel sales challan" });
    }
}
async function remove(req, res) {
    try {
        if (!req.user?.businessId) {
            return res.status(403).json({ success: false, message: "Business context required" });
        }
        const deleted = await (0, challan_service_1.deleteChallan)(req.params.id, req.user.businessId);
        return res.status(200).json({ success: true, message: "Sales challan deleted successfully", data: deleted });
    }
    catch (error) {
        console.error(error);
        if (error.message === "Challan not found") {
            return res.status(404).json({ success: false, message: "Resource not found" });
        }
        if (error.message.includes("Only DRAFT")) {
            return res.status(400).json({ success: false, message: error.message });
        }
        return res.status(500).json({ success: false, message: "Failed to delete sales challan" });
    }
}
//# sourceMappingURL=challan.controller.js.map