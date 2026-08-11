import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
export declare function getDashboard(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
declare const _default: {
    getDashboard: typeof getDashboard;
};
export default _default;
//# sourceMappingURL=dashboard.controller.d.ts.map