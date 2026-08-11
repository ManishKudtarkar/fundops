"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const employee_controller_1 = require("../controllers/employee.controller");
const router = (0, express_1.Router)();
// All employee routes require authentication and business context
router.use(auth_middleware_1.authenticate);
router.use((0, role_middleware_1.requireBusiness)());
router.use((0, role_middleware_1.authorize)("BUSINESS_ADMIN"));
// List all employees in the business
router.get("/", employee_controller_1.list);
// Get employee details by ID
router.get("/:id", employee_controller_1.getById);
// Create a new employee
router.post("/", employee_controller_1.create);
// Update employee details or role
router.put("/:id", employee_controller_1.update);
// Reset employee password
router.post("/:id/reset-password", employee_controller_1.resetPassword);
exports.default = router;
//# sourceMappingURL=employee.routes.js.map