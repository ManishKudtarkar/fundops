import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import {
  getPlatformLogs,
  getBusinessLogs,
  getMyLogs,
} from "../controllers/audit.controller";

const router = Router();

// All audit log routes require authentication
router.use(authenticate);

// Platform-wide audit logs (SUPER_ADMIN only)
router.get("/platform", authorize("SUPER_ADMIN"), getPlatformLogs);

// Business audit logs (BUSINESS_ADMIN or SUPER_ADMIN)
router.get("/business", authorize("BUSINESS_ADMIN", "SUPER_ADMIN"), getBusinessLogs);

// My audit logs (any authenticated user)
router.get("/my", getMyLogs);

export default router;
