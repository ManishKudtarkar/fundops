import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest, AuthUser } from "./auth.middleware";

/**
 * Checks that the authenticated user has one of the allowed roles.
 */
export function authorize(...allowedRoles: AuthUser["role"][]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    console.log("🔐 Authorization check:", { userRole: req.user?.role, allowedRoles });
    
    if (!req.user) {
      console.log("❌ No user authenticated");
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      console.log("❌ Role not allowed:", req.user.role, "allowed:", allowedRoles);
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource",
      });
    }

    console.log("✅ Authorization passed");
    next();
  };
}

/**
 * Ensures that the authenticated user belongs to a business
 * (i.e. is NOT a SUPER_ADMIN without a business).
 *
 * SUPER_ADMIN can pass this check when they supply a target businessId
 * via the X-Business-Id header (for admin inspection only).
 * For all normal requests the businessId from the JWT is used.
 */
export function requireBusiness() {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    if (!req.user.businessId) {
      return res.status(403).json({
        success: false,
        message: "This endpoint requires a business context",
      });
    }

    next();
  };
}

/**
 * Convenience: authenticate + require role + require business.
 * Not a standalone middleware – use individually.
 */
export function isSuperAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({ success: false, message: "Super Admin access required" });
  }
  next();
}
