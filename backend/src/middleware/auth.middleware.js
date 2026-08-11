"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
}
function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        console.log("🔐 Authenticate middleware - Auth header:", authHeader ? "present" : "missing");
        if (!authHeader) {
            console.log("❌ Missing authorization header");
            return res.status(401).json({
                success: false,
                message: "Authorization header is required",
            });
        }
        if (!authHeader.startsWith("Bearer ")) {
            console.log("❌ Invalid authorization format");
            return res.status(401).json({
                success: false,
                message: "Invalid authorization format",
            });
        }
        const token = authHeader.substring(7);
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        console.log("✅ Token decoded:", { userId: decoded.userId, role: decoded.role });
        req.user = decoded;
        next();
    }
    catch (error) {
        console.log("❌ Token verification failed:", error instanceof Error ? error.message : error);
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
}
//# sourceMappingURL=auth.middleware.js.map