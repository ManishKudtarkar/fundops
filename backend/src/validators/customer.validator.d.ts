import { z } from "zod";
export declare const createCustomerSchema: z.ZodObject<{
    name: z.ZodString;
    mobile: z.ZodString;
    email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    businessName: z.ZodString;
    gstNumber: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    customerType: z.ZodEnum<{
        RETAIL: "RETAIL";
        WHOLESALE: "WHOLESALE";
        DISTRIBUTOR: "DISTRIBUTOR";
    }>;
    address: z.ZodString;
    status: z.ZodEnum<{
        ACTIVE: "ACTIVE";
        INACTIVE: "INACTIVE";
        LEAD: "LEAD";
    }>;
    followUpDate: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateCustomerSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    mobile: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
    businessName: z.ZodOptional<z.ZodString>;
    gstNumber: z.ZodOptional<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
    customerType: z.ZodOptional<z.ZodEnum<{
        RETAIL: "RETAIL";
        WHOLESALE: "WHOLESALE";
        DISTRIBUTOR: "DISTRIBUTOR";
    }>>;
    address: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        ACTIVE: "ACTIVE";
        INACTIVE: "INACTIVE";
        LEAD: "LEAD";
    }>>;
    followUpDate: z.ZodOptional<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
    notes: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
//# sourceMappingURL=customer.validator.d.ts.map