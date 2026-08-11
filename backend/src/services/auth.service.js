"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = loginUser;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
}
async function loginUser(email, password) {
    const user = await prisma_1.default.user.findUnique({
        where: { email },
        include: { business: true },
    });
    if (!user) {
        throw new Error("Invalid email or password");
    }
    if (!user.isActive) {
        throw new Error("Account is deactivated. Contact your administrator.");
    }
    const passwordMatch = await bcryptjs_1.default.compare(password, user.password);
    if (!passwordMatch) {
        throw new Error("Invalid email or password");
    }
    // Check business is active (for non-SUPER_ADMIN)
    if (user.businessId && user.business) {
        if (user.business.status === "SUSPENDED") {
            throw new Error("Your business account has been suspended. Contact support.");
        }
        if (user.business.status === "INACTIVE") {
            throw new Error("Your business account is inactive. Contact support.");
        }
    }
    // businessId is included in JWT — backend derives it from the signed token,
    // so frontend can never spoof it.
    const token = jsonwebtoken_1.default.sign({
        userId: user.id,
        role: user.role,
        email: user.email,
        businessId: user.businessId ?? null,
    }, JWT_SECRET, { expiresIn: "1d" });
    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            businessId: user.businessId ?? null,
            businessName: user.business?.name ?? null,
        },
    };
}
//# sourceMappingURL=auth.service.js.map