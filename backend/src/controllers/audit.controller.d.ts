import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
export declare function getPlatformLogs(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getBusinessLogs(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getMyLogs(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=audit.controller.d.ts.map