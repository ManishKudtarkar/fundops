"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmployees = getEmployees;
exports.getEmployeeById = getEmployeeById;
exports.createEmployee = createEmployee;
exports.updateEmployee = updateEmployee;
exports.resetEmployeePassword = resetEmployeePassword;
const prisma_1 = __importDefault(require("../lib/prisma"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
async function getEmployees(businessId) {
    return prisma_1.default.user.findMany({
        where: { businessId },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
    });
}
async function getEmployeeById(id, businessId) {
    return prisma_1.default.user.findFirst({
        where: { id, businessId },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
        },
    });
}
async function createEmployee(businessId, data) {
    const hashedPassword = await bcryptjs_1.default.hash(data.password, 12);
    const allowedRoles = ["BUSINESS_ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"];
    if (!allowedRoles.includes(data.role)) {
        throw new Error(`Invalid role: ${data.role}`);
    }
    return prisma_1.default.user.create({
        data: {
            businessId,
            name: data.name,
            email: data.email,
            password: hashedPassword,
            role: data.role,
            isActive: true,
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
        },
    });
}
async function updateEmployee(id, businessId, data) {
    const existing = await prisma_1.default.user.findFirst({ where: { id, businessId } });
    if (!existing)
        return null;
    if (data.role) {
        const allowedRoles = ["BUSINESS_ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"];
        if (!allowedRoles.includes(data.role)) {
            throw new Error(`Invalid role: ${data.role}`);
        }
    }
    return prisma_1.default.user.update({
        where: { id },
        data: {
            ...(data.name !== undefined && { name: data.name }),
            ...(data.role !== undefined && { role: data.role }),
            ...(data.isActive !== undefined && { isActive: data.isActive }),
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            updatedAt: true,
        },
    });
}
async function resetEmployeePassword(id, businessId, newPassword) {
    const existing = await prisma_1.default.user.findFirst({ where: { id, businessId } });
    if (!existing)
        return null;
    const hashed = await bcryptjs_1.default.hash(newPassword, 12);
    return prisma_1.default.user.update({
        where: { id },
        data: { password: hashed },
        select: { id: true, name: true, email: true },
    });
}
//# sourceMappingURL=employee.service.js.map