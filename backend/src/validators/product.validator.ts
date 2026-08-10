import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(2, "Product name is required"),

  sku: z.string().min(2, "SKU is required"),

  category: z.string().min(2, "Category is required"),

  unitPrice: z
    .number()
    .nonnegative("Unit price cannot be negative"),

  currentStock: z
    .number()
    .int()
    .nonnegative("Stock cannot be negative")
    .default(0),

  minimumStock: z
    .number()
    .int()
    .nonnegative("Minimum stock cannot be negative")
    .default(0),

  location: z.string().min(2, "Warehouse/location is required"),
});

export const updateProductSchema =
  createProductSchema.partial();

export const stockMovementSchema = z.object({
  quantity: z
    .number()
    .int()
    .positive("Quantity must be greater than zero"),

  movementType: z.enum(["IN", "OUT"]),

  reason: z.string().min(2, "Reason is required"),
});