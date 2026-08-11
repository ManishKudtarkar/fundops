"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const customer_controller_1 = require("../controllers/customer.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.post("/", (0, role_middleware_1.authorize)("BUSINESS_ADMIN", "SALES"), customer_controller_1.create);
router.get("/", (0, role_middleware_1.authorize)("BUSINESS_ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"), customer_controller_1.list);
router.get("/:id", (0, role_middleware_1.authorize)("BUSINESS_ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"), customer_controller_1.getById);
router.put("/:id", (0, role_middleware_1.authorize)("BUSINESS_ADMIN", "SALES"), customer_controller_1.update);
router.post("/:id/follow-up", (0, role_middleware_1.authorize)("BUSINESS_ADMIN", "SALES"), customer_controller_1.followUp);
router.delete("/:id", (0, role_middleware_1.authorize)("BUSINESS_ADMIN", "SALES"), customer_controller_1.remove);
exports.default = router;
//# sourceMappingURL=customer.routes.js.map