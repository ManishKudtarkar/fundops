"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFollowUp = createFollowUp;
exports.getFollowUps = getFollowUps;
exports.getFollowUpById = getFollowUpById;
exports.updateFollowUp = updateFollowUp;
exports.getDashboardFollowUps = getDashboardFollowUps;
exports.deleteFollowUp = deleteFollowUp;
const prisma_1 = __importDefault(require("../lib/prisma"));
async function createFollowUp(businessId, customerId, data, createdBy) {
    // Verify customer belongs to business
    const customer = await prisma_1.default.customer.findFirst({
        where: { id: customerId, businessId },
    });
    if (!customer) {
        throw new Error("Customer not found");
    }
    return prisma_1.default.followUp.create({
        data: {
            businessId,
            customerId,
            title: data.title,
            notes: data.notes || null,
            followUpDate: new Date(data.followUpDate),
            assignedTo: data.assignedTo || null,
            createdBy,
            status: "PENDING",
        },
        include: {
            customer: { select: { id: true, name: true, email: true, mobile: true } },
            assignedToUser: { select: { id: true, name: true, email: true } },
            createdByUser: { select: { id: true, name: true, email: true } },
        },
    });
}
async function getFollowUps(filters) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;
    const where = { businessId: filters.businessId };
    if (filters.status) {
        where.status = filters.status;
    }
    if (filters.customerId) {
        where.customerId = filters.customerId;
    }
    if (filters.assignedTo) {
        where.assignedTo = filters.assignedTo;
    }
    if (filters.dateFrom || filters.dateTo) {
        where.followUpDate = {};
        if (filters.dateFrom) {
            where.followUpDate.gte = new Date(filters.dateFrom);
        }
        if (filters.dateTo) {
            const end = new Date(filters.dateTo);
            end.setHours(23, 59, 59, 999);
            where.followUpDate.lte = end;
        }
    }
    const [followUps, total] = await Promise.all([
        prisma_1.default.followUp.findMany({
            where,
            skip,
            take: limit,
            orderBy: { followUpDate: "asc" },
            include: {
                customer: { select: { id: true, name: true, email: true, mobile: true } },
                assignedToUser: { select: { id: true, name: true, email: true } },
                createdByUser: { select: { id: true, name: true, email: true } },
            },
        }),
        prisma_1.default.followUp.count({ where }),
    ]);
    return {
        followUps,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
}
async function getFollowUpById(id, businessId) {
    return prisma_1.default.followUp.findFirst({
        where: { id, businessId },
        include: {
            customer: { select: { id: true, name: true, email: true, mobile: true } },
            assignedToUser: { select: { id: true, name: true, email: true } },
            createdByUser: { select: { id: true, name: true, email: true } },
        },
    });
}
async function updateFollowUp(id, businessId, data) {
    const existing = await prisma_1.default.followUp.findFirst({
        where: { id, businessId },
    });
    if (!existing) {
        return null;
    }
    return prisma_1.default.followUp.update({
        where: { id },
        data: {
            ...(data.title !== undefined && { title: data.title }),
            ...(data.notes !== undefined && { notes: data.notes }),
            ...(data.followUpDate !== undefined && { followUpDate: new Date(data.followUpDate) }),
            ...(data.assignedTo !== undefined && { assignedTo: data.assignedTo }),
            ...(data.status !== undefined && { status: data.status }),
        },
        include: {
            customer: { select: { id: true, name: true, email: true, mobile: true } },
            assignedToUser: { select: { id: true, name: true, email: true } },
            createdByUser: { select: { id: true, name: true, email: true } },
        },
    });
}
async function getDashboardFollowUps(businessId) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const [todayFollowUps, overdueFollowUps, upcomingFollowUps] = await Promise.all([
        // Today's follow-ups
        prisma_1.default.followUp.findMany({
            where: {
                businessId,
                status: "PENDING",
                followUpDate: {
                    gte: today,
                    lt: tomorrow,
                },
            },
            include: {
                customer: { select: { id: true, name: true } },
                assignedToUser: { select: { id: true, name: true } },
            },
        }),
        // Overdue follow-ups
        prisma_1.default.followUp.findMany({
            where: {
                businessId,
                status: "PENDING",
                followUpDate: {
                    lt: today,
                },
            },
            include: {
                customer: { select: { id: true, name: true } },
                assignedToUser: { select: { id: true, name: true } },
            },
            orderBy: { followUpDate: "asc" },
            take: 10,
        }),
        // Upcoming follow-ups (next 7 days)
        prisma_1.default.followUp.findMany({
            where: {
                businessId,
                status: "PENDING",
                followUpDate: {
                    gte: tomorrow,
                    lt: new Date(tomorrow.getTime() + 7 * 24 * 60 * 60 * 1000),
                },
            },
            include: {
                customer: { select: { id: true, name: true } },
                assignedToUser: { select: { id: true, name: true } },
            },
            orderBy: { followUpDate: "asc" },
            take: 10,
        }),
    ]);
    return {
        today: todayFollowUps,
        overdue: overdueFollowUps,
        upcoming: upcomingFollowUps,
    };
}
async function deleteFollowUp(id, businessId) {
    const existing = await prisma_1.default.followUp.findFirst({
        where: { id, businessId },
    });
    if (!existing) {
        return null;
    }
    return prisma_1.default.followUp.delete({ where: { id } });
}
//# sourceMappingURL=followup.service.js.map