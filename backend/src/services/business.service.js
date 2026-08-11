"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBusiness = createBusiness;
exports.getBusinesses = getBusinesses;
exports.getBusinessById = getBusinessById;
exports.updateBusiness = updateBusiness;
exports.setBusinessStatus = setBusinessStatus;
const prisma_1 = __importDefault(require("../lib/prisma"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
async function createBusiness(input) {
    // Hash password BEFORE any database operations to avoid timeouts
    const hashedPassword = await bcryptjs_1.default.hash(input.adminPassword, 10);
    try {
        // Create the business first
        const business = await prisma_1.default.business.create({
            data: {
                name: input.name,
                legalName: input.legalName || null,
                email: input.email || null,
                phone: input.phone || null,
                address: input.address || null,
                city: input.city || null,
                state: input.state || null,
                country: input.country || null,
                postalCode: input.postalCode || null,
                gstin: input.gstin || null,
                status: "ACTIVE",
            },
        });
        // Create the business admin user
        const admin = await prisma_1.default.user.create({
            data: {
                businessId: business.id,
                name: input.adminName,
                email: input.adminEmail,
                password: hashedPassword,
                role: "BUSINESS_ADMIN",
                isActive: true,
            },
            select: { id: true, name: true, email: true, role: true },
        });
        return { business, admin };
    }
    catch (error) {
        // If user creation fails, try to clean up the business (best effort)
        if (error instanceof Error && error.message.includes("Unique constraint failed")) {
            throw new Error("Admin email already exists");
        }
        throw error;
    }
}
async function getBusinesses(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [businesses, total] = await Promise.all([
        prisma_1.default.business.findMany({
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                _count: {
                    select: { users: true, customers: true, products: true, challans: true },
                },
                users: {
                    where: { role: "BUSINESS_ADMIN" },
                    select: { id: true, name: true, email: true },
                    take: 1,
                },
            },
        }),
        prisma_1.default.business.count(),
    ]);
    return {
        businesses,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
}
async function getBusinessById(id) {
    return prisma_1.default.business.findUnique({
        where: { id },
        include: {
            _count: {
                select: { users: true, customers: true, products: true, challans: true },
            },
            users: {
                select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
            },
        },
    });
}
async function updateBusiness(id, data) {
    return prisma_1.default.business.update({
        where: { id },
        data: {
            ...(data.name !== undefined && { name: data.name }),
            ...(data.legalName !== undefined && { legalName: data.legalName }),
            ...(data.email !== undefined && { email: data.email }),
            ...(data.phone !== undefined && { phone: data.phone }),
            ...(data.address !== undefined && { address: data.address }),
            ...(data.city !== undefined && { city: data.city }),
            ...(data.state !== undefined && { state: data.state }),
            ...(data.country !== undefined && { country: data.country }),
            ...(data.postalCode !== undefined && { postalCode: data.postalCode }),
            ...(data.gstin !== undefined && { gstin: data.gstin }),
        },
    });
}
async function setBusinessStatus(id, status) {
    return prisma_1.default.business.update({ where: { id }, data: { status } });
}
//# sourceMappingURL=business.service.js.map