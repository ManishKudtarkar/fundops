import { z } from "zod";

export const createCustomerSchema = z.object({
  name: z.string().min(2, "Customer name is required"),

  mobile: z
    .string()
    .min(10, "Mobile number must be at least 10 digits"),

  email: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),

  businessName: z
    .string()
    .min(2, "Business name is required"),

  gstNumber: z
    .string()
    .optional()
    .or(z.literal("")),

  customerType: z.enum([
    "RETAIL",
    "WHOLESALE",
    "DISTRIBUTOR",
  ]),

  address: z
    .string()
    .min(5, "Address is required"),

  status: z.enum([
    "LEAD",
    "ACTIVE",
    "INACTIVE",
  ]),

  followUpDate: z
    .string()
    .datetime()
    .optional()
    .or(z.literal("")),

  notes: z
    .string()
    .optional(),
});

export const updateCustomerSchema =
  createCustomerSchema.partial();