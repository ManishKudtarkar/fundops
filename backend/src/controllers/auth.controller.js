"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
const auth_service_1 = require("../services/auth.service");
const business_service_1 = require("../services/business.service");
async function register(req, res) {
    try {
        const { businessName, adminName, adminEmail, adminPassword } = req.body;
        if (!businessName || !adminName || !adminEmail || !adminPassword) {
            return res.status(400).json({
                success: false,
                message: "Business name, your name, email, and password are required",
            });
        }
        const result = await (0, business_service_1.createBusiness)({
            name: businessName,
            adminName,
            adminEmail,
            adminPassword,
        });
        return res.status(201).json({
            success: true,
            message: "Business registered successfully",
            data: result,
        });
    }
    catch (error) {
        if (error?.code === "P2002" || error?.message?.includes("already exists")) {
            return res.status(409).json({ success: false, message: "Email already in use" });
        }
        return res.status(500).json({ success: false, message: "Registration failed" });
    }
}
async function login(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }
        const result = await (0, auth_service_1.loginUser)(email, password);
        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: result,
        });
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            message: error instanceof Error
                ? error.message
                : "Authentication failed",
        });
    }
}
//# sourceMappingURL=auth.controller.js.map