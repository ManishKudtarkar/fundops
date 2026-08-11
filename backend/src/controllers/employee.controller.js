"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.list = list;
exports.getById = getById;
exports.create = create;
exports.update = update;
exports.resetPassword = resetPassword;
const employee_service_1 = require("../services/employee.service");
async function list(req, res) {
    try {
        if (!req.user?.businessId) {
            return res.status(403).json({ success: false, message: "Business context required" });
        }
        const employees = await (0, employee_service_1.getEmployees)(req.user.businessId);
        return res.status(200).json({ success: true, data: employees });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Failed to fetch employees" });
    }
}
async function getById(req, res) {
    try {
        if (!req.user?.businessId) {
            return res.status(403).json({ success: false, message: "Business context required" });
        }
        const employee = await (0, employee_service_1.getEmployeeById)(req.params.id, req.user.businessId);
        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found" });
        }
        return res.status(200).json({ success: true, data: employee });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Failed to fetch employee" });
    }
}
async function create(req, res) {
    try {
        if (!req.user?.businessId) {
            return res.status(403).json({ success: false, message: "Business context required" });
        }
        const { name, email, password, role } = req.body;
        if (!name || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "Name, email, password, and role are required",
            });
        }
        try {
            const employee = await (0, employee_service_1.createEmployee)(req.user.businessId, {
                name,
                email,
                password,
                role,
            });
            return res.status(201).json({
                success: true,
                message: "Employee created successfully",
                data: employee,
            });
        }
        catch (error) {
            if (error.message.includes("Invalid role")) {
                return res.status(400).json({
                    success: false,
                    message: error.message,
                });
            }
            throw error;
        }
    }
    catch (error) {
        console.error(error);
        if (error.code === "P2002") {
            return res.status(409).json({
                success: false,
                message: "Email already in use",
            });
        }
        return res.status(500).json({ success: false, message: "Failed to create employee" });
    }
}
async function update(req, res) {
    try {
        if (!req.user?.businessId) {
            return res.status(403).json({ success: false, message: "Business context required" });
        }
        const { name, role, isActive } = req.body;
        if (!name && role === undefined && isActive === undefined) {
            return res.status(400).json({
                success: false,
                message: "At least one field (name, role, or isActive) is required",
            });
        }
        try {
            const employee = await (0, employee_service_1.updateEmployee)(req.params.id, req.user.businessId, {
                name,
                role,
                isActive,
            });
            if (!employee) {
                return res.status(404).json({ success: false, message: "Employee not found" });
            }
            return res.status(200).json({
                success: true,
                message: "Employee updated successfully",
                data: employee,
            });
        }
        catch (error) {
            if (error.message.includes("Invalid role")) {
                return res.status(400).json({
                    success: false,
                    message: error.message,
                });
            }
            throw error;
        }
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Failed to update employee" });
    }
}
async function resetPassword(req, res) {
    try {
        if (!req.user?.businessId) {
            return res.status(403).json({ success: false, message: "Business context required" });
        }
        const { newPassword } = req.body;
        if (!newPassword) {
            return res.status(400).json({
                success: false,
                message: "New password is required",
            });
        }
        const employee = await (0, employee_service_1.resetEmployeePassword)(req.params.id, req.user.businessId, newPassword);
        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found" });
        }
        return res.status(200).json({
            success: true,
            message: "Password reset successfully",
            data: employee,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Failed to reset password" });
    }
}
//# sourceMappingURL=employee.controller.js.map