import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
export declare function create(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function list(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getById(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function confirm(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function cancel(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function remove(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=challan.controller.d.ts.map