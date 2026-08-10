import prisma from "../lib/prisma";

interface ProductFilters {
  search?: string;
  category?: string;
  lowStock?: boolean;
  page?: number;
  limit?: number;
}

export async function createProduct(data: any) {
  return prisma.product.create({
    data: {
      name: data.name,
      sku: data.sku,
      category: data.category,
      unitPrice: data.unitPrice,
      currentStock: data.currentStock ?? 0,
      minimumStock: data.minimumStock ?? 0,
      location: data.location,
    },
  });
}

export async function getProducts(
  filters: ProductFilters
) {
  const page = filters.page || 1;
  const limit = filters.limit || 10;

  const skip = (page - 1) * limit;

  const where: any = {};

  if (filters.search) {
    where.OR = [
      {
        name: {
          contains: filters.search,
          mode: "insensitive",
        },
      },
      {
        sku: {
          contains: filters.search,
          mode: "insensitive",
        },
      },
    ];
  }

  if (filters.category) {
    where.category = filters.category;
  }

  if (filters.lowStock) {
    where.currentStock = {
      lte: prisma.product.fields.minimumStock,
    };
  }

  const [products, total] =
    await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.product.count({
        where,
      }),
    ]);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getProductById(
  id: string
) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      stockMovements: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });
}

export async function updateProduct(
  id: string,
  data: any
) {
  return prisma.product.update({
    where: { id },
    data,
  });
}

export async function createStockMovement(
  productId: string,
  quantity: number,
  movementType: "IN" | "OUT",
  reason: string,
  createdById: string
) {
  return prisma.$transaction(
    async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new Error("Product not found");
      }

      let newStock = product.currentStock;

      if (movementType === "IN") {
        newStock += quantity;
      }

      if (movementType === "OUT") {
        if (product.currentStock < quantity) {
          throw new Error(
            `Insufficient stock. Available stock: ${product.currentStock}`
          );
        }

        newStock -= quantity;
      }

      const updatedProduct =
        await tx.product.update({
          where: { id: productId },
          data: {
            currentStock: newStock,
          },
        });

      const movement =
        await tx.stockMovement.create({
          data: {
            productId,
            quantity,
            movementType,
            reason,
            createdById,
          },
        });

      return {
        product: updatedProduct,
        movement,
      };
    },
    {
      maxWait: 10000,
      timeout: 20000,
    }
  );
}