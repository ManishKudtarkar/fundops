"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const inventory_controller_1 = require("../controllers/inventory.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get("/movements", (0, role_middleware_1.authorize)("BUSINESS_ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"), inventory_controller_1.listMovements);
exports.default = router;
//# sourceMappingURL=inventory.routes.js.map