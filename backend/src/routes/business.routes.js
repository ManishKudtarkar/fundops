"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const business_controller_1 = require("../controllers/business.controller");
const router = (0, express_1.Router)();
// All business routes require authentication and SUPER_ADMIN role
router.use(auth_middleware_1.authenticate);
router.use((0, role_middleware_1.authorize)("SUPER_ADMIN"));
// Create a new business with admin user
router.post("/", business_controller_1.create);
// List all businesses with pagination
router.get("/", business_controller_1.list);
// Get business details by ID
router.get("/:id", business_controller_1.getById);
// Update business details
router.put("/:id", business_controller_1.update);
// Set business status (ACTIVE, SUSPENDED, INACTIVE)
router.post("/:id/status", business_controller_1.setStatus);
exports.default = router;
//# sourceMappingURL=business.routes.js.map