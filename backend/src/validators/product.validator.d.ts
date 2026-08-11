import { z } from "zod";
export declare const createProductSchema: z.ZodObject<{
    name: z.ZodString;
    sku: z.ZodString;
    category: z.ZodString;
    unitPrice: z.ZodNumber;
    currentStock: z.ZodDefault<z.ZodNumber>;
    minimumStock: z.ZodDefault<z.ZodNumber>;
    location: z.ZodString;
}, z.core.$strip>;
export declare const updateProductSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    sku: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodString>;
    unitPrice: z.ZodOptional<z.ZodNumber>;
    currentStock: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    minimumStock: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    location: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const stockMovementSchema: z.ZodObject<{
    quantity: z.ZodNumber;
    movementType: z.ZodEnum<{
        IN: "IN";
        OUT: "OUT";
        ADJUSTMENT: "ADJUSTMENT";
    }>;
    reason: z.ZodString;
}, z.core.$strip>;
//# sourceMappingURL=product.validator.d.ts.map