"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProduct = createProduct;
exports.getProducts = getProducts;
exports.getProductById = getProductById;
exports.updateProduct = updateProduct;
exports.createStockMovement = createStockMovement;
exports.createStockMovementAndClearCache = createStockMovementAndClearCache;
exports.getStockMovements = getStockMovements;
const prisma_1 = __importDefault(require("../lib/prisma"));
const dashboard_service_1 = require("./dashboard.service");
async function createProduct(data, businessId) {
    const p = await prisma_1.default.product.create({
        data: {
            businessId,
            name: data.name,
            sku: data.sku,
            category: data.category,
            unitPrice: data.unitPrice,
            currentStock: data.currentStock ?? 0,
            minimumStock: data.minimumStock ?? 0,
            location: data.location,
        },
    });
    try {
        (0, dashboard_service_1.clearDashboardCache)(businessId);
    }
    catch (_) { }
    return p;
}
async function getProducts(filters) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;
    const where = { businessId: filters.businessId };
    if (filters.search) {
        where.OR = [
            { name: { contains: filters.search, mode: "insensitive" } },
            { sku: { contains: filters.search, mode: "insensitive" } },
        ];
    }
    if (filters.category) {
        where.category = filters.category;
    }
    if (filters.lowStock) {
        const lowStockProducts = await prisma_1.default.$queryRaw `
      SELECT id FROM "Product"
      WHERE "businessId" = ${filters.businessId}
        AND "currentStock" <= "minimumStock"
    `;
        const ids = lowStockProducts.map((p) => p.id);
        if (ids.length === 0) {
            return { products: [], pagination: { page, limit, total: 0, totalPages: 0 } };
        }
        where.id = { in: ids };
    }
    const [products, total] = await Promise.all([
        prisma_1.default.product.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
        }),
        prisma_1.default.product.count({ where }),
    ]);
    return {
        products,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
}
async function getProductById(id, businessId) {
    return prisma_1.default.product.findFirst({
        where: { id, businessId },
        include: {
            stockMovements: {
                orderBy: { createdAt: "desc" },
                take: 20,
            },
        },
    });
}
async function updateProduct(id, businessId, data) {
    const existing = await prisma_1.default.product.findFirst({ where: { id, businessId } });
    if (!existing)
        return null;
    const p = await prisma_1.default.product.update({ where: { id }, data });
    try {
        (0, dashboard_service_1.clearDashboardCache)(businessId);
    }
    catch (_) { }
    return p;
}
async function createStockMovement(productId, businessId, quantity, movementType, reason, createdById, referenceType = "MANUAL", referenceId) {
    return prisma_1.default.$transaction(async (tx) => {
        // Verify the product belongs to THIS business (prevent cross-business attack)
        const product = await tx.product.findFirst({
            where: { id: productId, businessId },
        });
        if (!product) {
            throw new Error("Product not found");
        }
        const previousStock = product.currentStock;
        let newStock = previousStock;
        if (movementType === "IN") {
            newStock = previousStock + quantity;
        }
        else if (movementType === "OUT") {
            if (product.currentStock < quantity) {
                throw new Error(`Insufficient stock. Available stock: ${product.currentStock}`);
            }
            newStock = previousStock - quantity;
        }
        else if (movementType === "ADJUSTMENT") {
            newStock = quantity; // quantity IS the new stock level
        }
        const updatedProduct = await tx.product.update({
            where: { id: productId },
            data: { currentStock: newStock },
        });
        const movement = await tx.stockMovement.create({
            data: {
                businessId,
                productId,
                quantity,
                movementType,
                previousStock,
                newStock,
                referenceType,
                referenceId: referenceId || null,
                reason,
                createdById,
            },
        });
        return { product: updatedProduct, movement };
    }, { maxWait: 10000, timeout: 20000 });
}
async function createStockMovementAndClearCache(productId, businessId, quantity, movementType, reason, createdById, referenceType = "MANUAL", referenceId) {
    const res = await createStockMovement(productId, businessId, quantity, movementType, reason, createdById, referenceType, referenceId);
    try {
        (0, dashboard_service_1.clearDashboardCache)(businessId);
    }
    catch (_) { }
    return res;
}
async function getStockMovements(filters) {
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;
    const where = {
        businessId: filters.businessId, // ALWAYS scoped
    };
    if (filters.productId) {
        where.productId = filters.productId;
    }
    if (filters.movementType) {
        where.movementType = filters.movementType;
    }
    if (filters.referenceId) {
        where.referenceId = { contains: filters.referenceId, mode: "insensitive" };
    }
    if (filters.createdById) {
        where.createdById = filters.createdById;
    }
    if (filters.dateFrom || filters.dateTo) {
        where.createdAt = {};
        if (filters.dateFrom)
            where.createdAt.gte = new Date(filters.dateFrom);
        if (filters.dateTo) {
            const end = new Date(filters.dateTo);
            end.setHours(23, 59, 59, 999);
            where.createdAt.lte = end;
        }
    }
    if (filters.search) {
        where.product = {
            OR: [
                { name: { contains: filters.search, mode: "insensitive" } },
                { sku: { contains: filters.search, mode: "insensitive" } },
            ],
        };
    }
    const [movements, total] = await Promise.all([
        prisma_1.default.stockMovement.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                product: { select: { id: true, name: true, sku: true, location: true } },
                createdBy: { select: { id: true, name: true, email: true, role: true } },
            },
        }),
        prisma_1.default.stockMovement.count({ where }),
    ]);
    return {
        movements,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
}
//# sourceMappingURL=product.service.js.map