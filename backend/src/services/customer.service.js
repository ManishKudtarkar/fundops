"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCustomer = createCustomer;
exports.getCustomers = getCustomers;
exports.getCustomerById = getCustomerById;
exports.updateCustomer = updateCustomer;
exports.deleteCustomer = deleteCustomer;
exports.addFollowUp = addFollowUp;
const prisma_1 = __importDefault(require("../lib/prisma"));
async function createCustomer(data, userId, businessId) {
    return prisma_1.default.customer.create({
        data: {
            businessId,
            name: data.name,
            mobile: data.mobile,
            email: data.email || null,
            businessName: data.businessName,
            gstNumber: data.gstNumber || null,
            customerType: data.customerType,
            address: data.address,
            status: data.status,
            followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
            notes: data.notes || null,
            createdById: userId,
        },
    });
}
async function getCustomers(filters) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;
    const where = { businessId: filters.businessId };
    if (filters.search) {
        where.OR = [
            { name: { contains: filters.search, mode: "insensitive" } },
            { mobile: { contains: filters.search } },
            { businessName: { contains: filters.search, mode: "insensitive" } },
        ];
    }
    if (filters.status)
        where.status = filters.status;
    if (filters.customerType)
        where.customerType = filters.customerType;
    const [customers, total] = await Promise.all([
        prisma_1.default.customer.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" } }),
        prisma_1.default.customer.count({ where }),
    ]);
    return {
        customers,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
}
async function getCustomerById(id, businessId) {
    return prisma_1.default.customer.findFirst({
        where: { id, businessId },
        include: { challans: true },
    });
}
async function updateCustomer(id, businessId, data) {
    const existing = await prisma_1.default.customer.findFirst({ where: { id, businessId } });
    if (!existing)
        return null;
    return prisma_1.default.customer.update({
        where: { id },
        data: {
            ...data,
            followUpDate: data.followUpDate !== undefined
                ? data.followUpDate ? new Date(data.followUpDate) : null
                : undefined,
        },
    });
}
async function deleteCustomer(id, businessId) {
    const existing = await prisma_1.default.customer.findFirst({ where: { id, businessId } });
    if (!existing)
        return null;
    return prisma_1.default.customer.delete({ where: { id } });
}
async function addFollowUp(id, businessId, notes, followUpDate) {
    const existing = await prisma_1.default.customer.findFirst({ where: { id, businessId } });
    if (!existing)
        return null;
    const data = { notes };
    if (followUpDate !== undefined) {
        data.followUpDate = followUpDate ? new Date(followUpDate) : null;
    }
    return prisma_1.default.customer.update({ where: { id }, data });
}
//# sourceMappingURL=customer.service.js.map