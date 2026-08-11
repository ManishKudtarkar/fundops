"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const challan_controller_1 = require("../controllers/challan.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.post("/", (0, role_middleware_1.authorize)("BUSINESS_ADMIN", "SALES"), challan_controller_1.create);
router.get("/", (0, role_middleware_1.authorize)("BUSINESS_ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"), challan_controller_1.list);
router.get("/:id", (0, role_middleware_1.authorize)("BUSINESS_ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"), challan_controller_1.getById);
router.post("/:id/confirm", (0, role_middleware_1.authorize)("BUSINESS_ADMIN", "WAREHOUSE"), challan_controller_1.confirm);
router.post("/:id/cancel", (0, role_middleware_1.authorize)("BUSINESS_ADMIN", "SALES"), challan_controller_1.cancel);
router.delete("/:id", (0, role_middleware_1.authorize)("BUSINESS_ADMIN", "SALES"), challan_controller_1.remove);
exports.default = router;
//# sourceMappingURL=challan.routes.js.map