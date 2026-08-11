"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stockMovementSchema = exports.updateProductSchema = exports.createProductSchema = void 0;
const zod_1 = require("zod");
exports.createProductSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Product name is required"),
    sku: zod_1.z.string().min(2, "SKU is required"),
    category: zod_1.z.string().min(2, "Category is required"),
    unitPrice: zod_1.z
        .number()
        .nonnegative("Unit price cannot be negative"),
    currentStock: zod_1.z
        .number()
        .int()
        .nonnegative("Stock cannot be negative")
        .default(0),
    minimumStock: zod_1.z
        .number()
        .int()
        .nonnegative("Minimum stock cannot be negative")
        .default(0),
    location: zod_1.z.string().min(2, "Warehouse/location is required"),
});
exports.updateProductSchema = exports.createProductSchema.partial();
exports.stockMovementSchema = zod_1.z.object({
    quantity: zod_1.z
        .number()
        .int()
        .positive("Quantity must be greater than zero"),
    movementType: zod_1.z.enum(["IN", "OUT", "ADJUSTMENT"]),
    reason: zod_1.z.string().min(2, "Reason is required"),
});
//# sourceMappingURL=product.validator.js.map