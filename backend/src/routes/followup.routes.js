"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const followup_controller_1 = require("../controllers/followup.controller");
const router = (0, express_1.Router)();
// All follow-up routes require authentication and business context
router.use(auth_middleware_1.authenticate);
router.use((0, role_middleware_1.requireBusiness)());
router.use((0, role_middleware_1.authorize)("BUSINESS_ADMIN", "SALES"));
// List all follow-ups (with filters)
router.get("/", followup_controller_1.list);
// Get follow-up dashboard summary
router.get("/dashboard/summary", followup_controller_1.getDashboard);
// Get follow-up by ID
router.get("/:id", followup_controller_1.getById);
// Create follow-up
router.post("/", followup_controller_1.create);
// Update follow-up
router.put("/:id", followup_controller_1.update);
// Delete follow-up
router.delete("/:id", followup_controller_1.remove);
exports.default = router;
//# sourceMappingURL=followup.routes.js.map