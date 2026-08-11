"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = create;
exports.list = list;
exports.getById = getById;
exports.update = update;
exports.stockMovement = stockMovement;
const product_validator_1 = require("../validators/product.validator");
const product_service_1 = require("../services/product.service");
async function create(req, res) {
    try {
        if (!req.user?.businessId) {
            return res.status(403).json({ success: false, message: "Business context required" });
        }
        const validation = product_validator_1.createProductSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ success: false, message: "Validation failed", errors: validation.error.flatten() });
        }
        const product = await (0, product_service_1.createProduct)(validation.data, req.user.businessId);
        return res.status(201).json({ success: true, message: "Product created successfully", data: product });
    }
    catch (error) {
        console.error(error);
        if (error.code === "P2002") {
            return res.status(409).json({ success: false, message: "SKU already exists for this business" });
        }
        return res.status(500).json({ success: false, message: "Failed to create product" });
    }
}
async function list(req, res) {
    try {
        if (!req.user?.businessId) {
            return res.status(403).json({ success: false, message: "Business context required" });
        }
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const lowStock = req.query.lowStock === "true";
        const result = await (0, product_service_1.getProducts)({
            businessId: req.user.businessId,
            search: req.query.search,
            category: req.query.category,
            lowStock,
            page,
            limit,
        });
        return res.status(200).json({ success: true, data: result });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Failed to fetch products" });
    }
}
async function getById(req, res) {
    try {
        if (!req.user?.businessId) {
            return res.status(403).json({ success: false, message: "Business context required" });
        }
        const product = await (0, product_service_1.getProductById)(req.params.id, req.user.businessId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Resource not found" });
        }
        return res.status(200).json({ success: true, data: product });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Failed to fetch product" });
    }
}
async function update(req, res) {
    try {
        if (!req.user?.businessId) {
            return res.status(403).json({ success: false, message: "Business context required" });
        }
        const validation = product_validator_1.updateProductSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ success: false, message: "Validation failed", errors: validation.error.flatten() });
        }
        const product = await (0, product_service_1.updateProduct)(req.params.id, req.user.businessId, validation.data);
        if (!product) {
            return res.status(404).json({ success: false, message: "Resource not found" });
        }
        return res.status(200).json({ success: true, message: "Product updated successfully", data: product });
    }
    catch (error) {
        console.error(error);
        if (error.code === "P2002") {
            return res.status(409).json({ success: false, message: "SKU already exists for this business" });
        }
        return res.status(500).json({ success: false, message: "Failed to update product" });
    }
}
async function stockMovement(req, res) {
    try {
        if (!req.user?.businessId) {
            return res.status(403).json({ success: false, message: "Business context required" });
        }
        const validation = product_validator_1.stockMovementSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ success: false, message: "Validation failed", errors: validation.error.flatten() });
        }
        try {
            const result = await (0, product_service_1.createStockMovementAndClearCache)(req.params.id, req.user.businessId, validation.data.quantity, validation.data.movementType, validation.data.reason, req.user.userId, "MANUAL");
            return res.status(200).json({ success: true, message: "Stock movement recorded successfully", data: result });
        }
        catch (innerError) {
            if (innerError.message === "Product not found") {
                return res.status(404).json({ success: false, message: "Resource not found" });
            }
            if (innerError.message.startsWith("Insufficient stock")) {
                return res.status(400).json({ success: false, message: innerError.message });
            }
            throw innerError;
        }
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Failed to record stock movement" });
    }
}
//# sourceMappingURL=product.controller.js.map