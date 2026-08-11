"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const audit_controller_1 = require("../controllers/audit.controller");
const router = (0, express_1.Router)();
// All audit log routes require authentication
router.use(auth_middleware_1.authenticate);
// Platform-wide audit logs (SUPER_ADMIN only)
router.get("/platform", (0, role_middleware_1.authorize)("SUPER_ADMIN"), audit_controller_1.getPlatformLogs);
// Business audit logs (BUSINESS_ADMIN or SUPER_ADMIN)
router.get("/business", (0, role_middleware_1.authorize)("BUSINESS_ADMIN", "SUPER_ADMIN"), audit_controller_1.getBusinessLogs);
// My audit logs (any authenticated user)
router.get("/my", audit_controller_1.getMyLogs);
exports.default = router;
//# sourceMappingURL=audit.routes.js.map