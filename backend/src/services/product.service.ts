import prisma from "../lib/prisma";
import { clearDashboardCache } from "./dashboard.service";

interface ProductFilters {
  businessId: string;
  search?: string;
  category?: string;
  lowStock?: boolean;
  page?: number;
  limit?: number;
}

export async function createProduct(data: any, businessId: string) {
  const p = await prisma.product.create({
    data: {
      businessId,
      name: data.name,
      sku: data.sku,
      category: data.category,
      unitPrice: data.unitPrice,
      currentStock: data.currentStock ?? 0,
      minimumStock: data.minimumStock ?? 0,
      location: data.location,
    },
  });
  try { clearDashboardCache(businessId); } catch (_) {}
  return p;
}

export async function getProducts(filters: ProductFilters) {
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const skip = (page - 1) * limit;

  const where: any = { businessId: filters.businessId };

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { sku: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  if (filters.category) {
    where.category = filters.category;
  }

  if (filters.lowStock) {
    const lowStockProducts = await prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM "Product"
      WHERE "businessId" = ${filters.businessId}
        AND "currentStock" <= "minimumStock"
    `;
    const ids = lowStockProducts.map((p) => p.id);
    if (ids.length === 0) {
      return { products: [], pagination: { page, limit, total: 0, totalPages: 0 } };
    }
    where.id = { in: ids };
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getProductById(id: string, businessId: string) {
  return prisma.product.findFirst({
    where: { id, businessId },
    include: {
      stockMovements: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });
}

export async function updateProduct(id: string, businessId: string, data: any) {
  const existing = await prisma.product.findFirst({ where: { id, businessId } });
  if (!existing) return null;

  const p = await prisma.product.update({ where: { id }, data });
  try { clearDashboardCache(businessId); } catch (_) {}
  return p;
}

export async function createStockMovement(
  productId: string,
  businessId: string,
  quantity: number,
  movementType: "IN" | "OUT" | "ADJUSTMENT",
  reason: string,
  createdById: string,
  referenceType: "SALES_CHALLAN" | "MANUAL" | "ADJUSTMENT" = "MANUAL",
  referenceId?: string
) {
  return prisma.$transaction(
    async (tx) => {
      // Verify the product belongs to THIS business (prevent cross-business attack)
      const product = await tx.product.findFirst({
        where: { id: productId, businessId },
      });

      if (!product) {
        throw new Error("Product not found");
      }

      const previousStock = product.currentStock;
      let newStock = previousStock;

      if (movementType === "IN") {
        newStock = previousStock + quantity;
      } else if (movementType === "OUT") {
        if (product.currentStock < quantity) {
          throw new Error(`Insufficient stock. Available stock: ${product.currentStock}`);
        }
        newStock = previousStock - quantity;
      } else if (movementType === "ADJUSTMENT") {
        newStock = quantity; // quantity IS the new stock level
      }

      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: { currentStock: newStock },
      });

      const movement = await tx.stockMovement.create({
        data: {
          businessId,
          productId,
          quantity,
          movementType,
          previousStock,
          newStock,
          referenceType,
          referenceId: referenceId || null,
          reason,
          createdById,
        },
      });

      return { product: updatedProduct, movement };
    },
    { maxWait: 10000, timeout: 20000 }
  );
}

export async function createStockMovementAndClearCache(
  productId: string,
  businessId: string,
  quantity: number,
  movementType: "IN" | "OUT" | "ADJUSTMENT",
  reason: string,
  createdById: string,
  referenceType: "SALES_CHALLAN" | "MANUAL" | "ADJUSTMENT" = "MANUAL",
  referenceId?: string
) {
  const res = await createStockMovement(
    productId, businessId, quantity, movementType, reason, createdById, referenceType, referenceId
  );
  try { clearDashboardCache(businessId); } catch (_) {}
  return res;
}

export interface MovementFilters {
  businessId: string;
  search?: string;
  productId?: string;
  movementType?: "IN" | "OUT" | "ADJUSTMENT";
  dateFrom?: string;
  dateTo?: string;
  referenceId?: string;
  createdById?: string;
  page?: number;
  limit?: number;
}

export async function getStockMovements(filters: MovementFilters) {
  const page = filters.page || 1;
  const limit = filters.limit || 50;
  const skip = (page - 1) * limit;

  const where: any = {
    businessId: filters.businessId, // ALWAYS scoped
  };

  if (filters.productId) {
    where.productId = filters.productId;
  }

  if (filters.movementType) {
    where.movementType = filters.movementType;
  }

  if (filters.referenceId) {
    where.referenceId = { contains: filters.referenceId, mode: "insensitive" };
  }

  if (filters.createdById) {
    where.createdById = filters.createdById;
  }

  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
    if (filters.dateTo) {
      const end = new Date(filters.dateTo);
      end.setHours(23, 59, 59, 999);
      where.createdAt.lte = end;
    }
  }

  if (filters.search) {
    where.product = {
      OR: [
        { name: { contains: filters.search, mode: "insensitive" } },
        { sku: { contains: filters.search, mode: "insensitive" } },
      ],
    };
  }

  const [movements, total] = await Promise.all([
    prisma.stockMovement.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        product: { select: { id: true, name: true, sku: true, location: true } },
        createdBy: { select: { id: true, name: true, email: true, role: true } },
      },
    }),
    prisma.stockMovement.count({ where }),
  ]);

  return {
    movements,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}
