import type { Request, Response, NextFunction } from "express";
export interface AuthUser {
    userId: string;
    role: "SUPER_ADMIN" | "BUSINESS_ADMIN" | "SALES" | "WAREHOUSE" | "ACCOUNTS";
    email: string;
    businessId: string | null;
}
export interface AuthenticatedRequest extends Request {
    user?: AuthUser;
}
export declare function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): Response<any, Record<string, any>>;
//# sourceMappingURL=auth.middleware.d.ts.map