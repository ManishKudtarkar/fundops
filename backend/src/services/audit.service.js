"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuditLog = createAuditLog;
exports.getAuditLogs = getAuditLogs;
exports.getBusinessAuditLogs = getBusinessAuditLogs;
exports.getUserAuditLogs = getUserAuditLogs;
exports.auditLogin = auditLogin;
exports.auditLogout = auditLogout;
exports.auditCustomerAction = auditCustomerAction;
exports.auditProductAction = auditProductAction;
exports.auditStockMovement = auditStockMovement;
exports.auditChallanAction = auditChallanAction;
exports.auditUserAction = auditUserAction;
exports.auditBusinessAction = auditBusinessAction;
const prisma_1 = __importDefault(require("../lib/prisma"));
async function createAuditLog(entry) {
    return prisma_1.default.auditLog.create({
        data: {
            businessId: entry.businessId || null,
            userId: entry.userId,
            action: entry.action,
            entityType: entry.entityType,
            entityId: entry.entityId,
            metadata: entry.metadata || {},
            ipAddress: entry.ipAddress || null,
        },
    });
}
async function getAuditLogs(filters) {
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;
    const where = {};
    if (filters.businessId) {
        where.businessId = filters.businessId;
    }
    if (filters.userId) {
        where.userId = filters.userId;
    }
    if (filters.action) {
        where.action = filters.action;
    }
    if (filters.entityType) {
        where.entityType = filters.entityType;
    }
    if (filters.dateFrom || filters.dateTo) {
        where.createdAt = {};
        if (filters.dateFrom) {
            where.createdAt.gte = new Date(filters.dateFrom);
        }
        if (filters.dateTo) {
            const end = new Date(filters.dateTo);
            end.setHours(23, 59, 59, 999);
            where.createdAt.lte = end;
        }
    }
    const [logs, total] = await Promise.all([
        prisma_1.default.auditLog.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                user: {
                    select: { id: true, name: true, email: true, role: true },
                },
            },
        }),
        prisma_1.default.auditLog.count({ where }),
    ]);
    return {
        logs,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
}
async function getBusinessAuditLogs(businessId, page = 1, limit = 50) {
    return getAuditLogs({
        businessId,
        page,
        limit,
    });
}
async function getUserAuditLogs(userId, page = 1, limit = 50) {
    return getAuditLogs({
        userId,
        page,
        limit,
    });
}
// Audit log entry helpers
async function auditLogin(userId, ipAddress) {
    return createAuditLog({
        userId,
        action: "LOGIN",
        entityType: "USER",
        entityId: userId,
        ipAddress,
    });
}
async function auditLogout(userId, ipAddress) {
    return createAuditLog({
        userId,
        action: "LOGOUT",
        entityType: "USER",
        entityId: userId,
        ipAddress,
    });
}
async function auditCustomerAction(businessId, userId, action, customerId, metadata) {
    return createAuditLog({
        businessId,
        userId,
        action,
        entityType: "CUSTOMER",
        entityId: customerId,
        metadata,
    });
}
async function auditProductAction(businessId, userId, action, productId, metadata) {
    return createAuditLog({
        businessId,
        userId,
        action,
        entityType: "PRODUCT",
        entityId: productId,
        metadata,
    });
}
async function auditStockMovement(businessId, userId, movementType, movementId, metadata) {
    return createAuditLog({
        businessId,
        userId,
        action: movementType,
        entityType: "STOCK_MOVEMENT",
        entityId: movementId,
        metadata,
    });
}
async function auditChallanAction(businessId, userId, action, challanId, metadata) {
    return createAuditLog({
        businessId,
        userId,
        action,
        entityType: "CHALLAN",
        entityId: challanId,
        metadata,
    });
}
async function auditUserAction(businessId, userId, action, targetUserId, metadata) {
    return createAuditLog({
        businessId,
        userId,
        action,
        entityType: "USER",
        entityId: targetUserId,
        metadata,
    });
}
async function auditBusinessAction(userId, action, businessId, metadata) {
    return createAuditLog({
        businessId,
        userId,
        action,
        entityType: "BUSINESS",
        entityId: businessId,
        metadata,
    });
}
//# sourceMappingURL=audit.service.js.map