"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCustomerSchema = exports.createCustomerSchema = void 0;
const zod_1 = require("zod");
exports.createCustomerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Customer name is required"),
    mobile: zod_1.z
        .string()
        .min(10, "Mobile number must be at least 10 digits"),
    email: zod_1.z
        .string()
        .email("Invalid email address")
        .optional()
        .or(zod_1.z.literal("")),
    businessName: zod_1.z
        .string()
        .min(2, "Business name is required"),
    gstNumber: zod_1.z
        .string()
        .optional()
        .or(zod_1.z.literal("")),
    customerType: zod_1.z.enum([
        "RETAIL",
        "WHOLESALE",
        "DISTRIBUTOR",
    ]),
    address: zod_1.z
        .string()
        .min(5, "Address is required"),
    status: zod_1.z.enum([
        "LEAD",
        "ACTIVE",
        "INACTIVE",
    ]),
    followUpDate: zod_1.z
        .string()
        .datetime()
        .optional()
        .or(zod_1.z.literal("")),
    notes: zod_1.z
        .string()
        .optional(),
});
exports.updateCustomerSchema = exports.createCustomerSchema.partial();
//# sourceMappingURL=customer.validator.js.map