import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
export declare function create(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function list(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getById(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function update(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function setStatus(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=business.controller.d.ts.map