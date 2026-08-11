import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest, AuthUser } from "./auth.middleware";
/**
 * Checks that the authenticated user has one of the allowed roles.
 */
export declare function authorize(...allowedRoles: AuthUser["role"][]): (req: AuthenticatedRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
/**
 * Ensures that the authenticated user belongs to a business
 * (i.e. is NOT a SUPER_ADMIN without a business).
 *
 * SUPER_ADMIN can pass this check when they supply a target businessId
 * via the X-Business-Id header (for admin inspection only).
 * For all normal requests the businessId from the JWT is used.
 */
export declare function requireBusiness(): (req: AuthenticatedRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
/**
 * Convenience: authenticate + require role + require business.
 * Not a standalone middleware – use individually.
 */
export declare function isSuperAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): Response<any, Record<string, any>>;
//# sourceMappingURL=role.middleware.d.ts.map