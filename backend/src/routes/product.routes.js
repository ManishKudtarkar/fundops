"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const product_controller_1 = require("../controllers/product.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.post("/", (0, role_middleware_1.authorize)("BUSINESS_ADMIN", "WAREHOUSE"), product_controller_1.create);
router.get("/", (0, role_middleware_1.authorize)("BUSINESS_ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"), product_controller_1.list);
router.get("/:id", (0, role_middleware_1.authorize)("BUSINESS_ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"), product_controller_1.getById);
router.put("/:id", (0, role_middleware_1.authorize)("BUSINESS_ADMIN", "WAREHOUSE"), product_controller_1.update);
router.post("/:id/stock", (0, role_middleware_1.authorize)("BUSINESS_ADMIN", "WAREHOUSE"), product_controller_1.stockMovement);
exports.default = router;
//# sourceMappingURL=product.routes.js.map