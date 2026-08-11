"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateChallanSchema = exports.createChallanSchema = void 0;
const zod_1 = require("zod");
exports.createChallanSchema = zod_1.z.object({
    customerId: zod_1.z.string().uuid(),
    items: zod_1.z
        .array(zod_1.z.object({
        productId: zod_1.z.string().uuid(),
        quantity: zod_1.z.number().int().positive(),
    }))
        .min(1, "At least one product is required"),
});
exports.updateChallanSchema = zod_1.z.object({
    items: zod_1.z
        .array(zod_1.z.object({
        productId: zod_1.z.string().uuid(),
        quantity: zod_1.z.number().int().positive(),
    }))
        .min(1, "At least one product is required"),
});
//# sourceMappingURL=challan.validator.js.map