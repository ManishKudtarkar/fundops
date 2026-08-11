import { z } from "zod";
export declare const createChallanSchema: z.ZodObject<{
    customerId: z.ZodString;
    items: z.ZodArray<z.ZodObject<{
        productId: z.ZodString;
        quantity: z.ZodNumber;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const updateChallanSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        productId: z.ZodString;
        quantity: z.ZodNumber;
    }, z.core.$strip>>;
}, z.core.$strip>;
//# sourceMappingURL=challan.validator.d.ts.map