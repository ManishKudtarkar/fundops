import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthUser {
  userId: string;
  role: "SUPER_ADMIN" | "BUSINESS_ADMIN" | "SALES" | "WAREHOUSE" | "ACCOUNTS";
  email: string;
  businessId: string | null; // null for SUPER_ADMIN
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
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

    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    console.log("✅ Token decoded:", { userId: decoded.userId, role: decoded.role });

    req.user = decoded;

    next();
  } catch (error) {
    console.log("❌ Token verification failed:", error instanceof Error ? error.message : error);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}
