import prisma from "../lib/prisma";
import { randomUUID } from "crypto";

function generateChallanNumber() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const random = randomUUID()
    .replace(/-/g, "")
    .substring(0, 8)
    .toUpperCase();

  return `CH-${year}${month}${day}-${random}`;
}

export async function createChallan(
  customerId: string,
  items: {
    productId: string;
    quantity: number;
  }[],
  createdById: string
) {
  return prisma.$transaction(
    async (tx) => {
      // Check customer
      const customer = await tx.customer.findUnique({
        where: {
          id: customerId,
        },
      });

      if (!customer) {
        throw new Error("Customer not found");
      }

      // Prevent duplicate products in the same challan
      const productIds = items.map((item) => item.productId);

      if (new Set(productIds).size !== productIds.length) {
        throw new Error(
          "A product cannot appear more than once in a challan"
        );
      }

      // Get products
      const products = await tx.product.findMany({
        where: {
          id: {
            in: productIds,
          },
        },
      });

      if (products.length !== productIds.length) {
        throw new Error("One or more products not found");
      }

      const productMap = new Map(
        products.map((product) => [
          product.id,
          product,
        ])
      );

      const challanItems = items.map((item) => {
        const product = productMap.get(
          item.productId
        );

        if (!product) {
          throw new Error("Product not found");
        }

        return {
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          unitPrice: product.unitPrice,
          quantity: item.quantity,
        };
      });

      const totalQuantity = items.reduce(
        (total, item) => total + item.quantity,
        0
      );

      const challan =
        await tx.challan.create({
          data: {
            challanNumber:
              generateChallanNumber(),

            customerId,

            totalQuantity,

            status: "DRAFT",

            createdById,

            items: {
              create: challanItems,
            },
          },

          include: {
            customer: true,
            items: true,
          },
        });

      return challan;
    },
    {
      maxWait: 10000,
      timeout: 20000,
    }
  );
}

export async function getChallans(
  page = 1,
  limit = 10
) {
  const skip = (page - 1) * limit;

  const [challans, total] =
    await Promise.all([
      prisma.challan.findMany({
        skip,
        take: limit,

        orderBy: {
          createdAt: "desc",
        },

        include: {
          customer: true,

          items: true,

          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      }),

      prisma.challan.count(),
    ]);

  return {
    challans,

    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(
        total / limit
      ),
    },
  };
}

export async function getChallanById(
  id: string
) {
  return prisma.challan.findUnique({
    where: {
      id,
    },

    include: {
      customer: true,

      items: {
        include: {
          product: true,
        },
      },

      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });
}

export async function confirmChallan(
  challanId: string,
  createdById: string
) {
  return prisma.$transaction(
    async (tx) => {
      const challan =
        await tx.challan.findUnique({
          where: {
            id: challanId,
          },

          include: {
            items: true,
          },
        });

      if (!challan) {
        throw new Error("Challan not found");
      }

      if (challan.status !== "DRAFT") {
        throw new Error(
          `Only DRAFT challans can be confirmed. Current status: ${challan.status}`
        );
      }

      /*
       * Deduct stock for every item.
       *
       * The update condition requires:
       *
       * currentStock >= requested quantity
       *
       * Therefore stock can never become negative.
       */
      for (const item of challan.items) {
        const updated =
          await tx.product.updateMany({
            where: {
              id: item.productId,

              currentStock: {
                gte: item.quantity,
              },
            },

            data: {
              currentStock: {
                decrement: item.quantity,
              },
            },
          });

        if (updated.count !== 1) {
          const product =
            await tx.product.findUnique({
              where: {
                id: item.productId,
              },
            });

          if (!product) {
            throw new Error(
              `Product not found: ${item.productName}`
            );
          }

          throw new Error(
            `Insufficient stock for ${item.productName}. Available stock: ${product.currentStock}, required: ${item.quantity}`
          );
        }

        await tx.stockMovement.create({
          data: {
            productId: item.productId,

            quantity: item.quantity,

            movementType: "OUT",

            reason: `Sales Challan ${challan.challanNumber}`,

            createdById,
          },
        });
      }

      const confirmed =
        await tx.challan.update({
          where: {
            id: challanId,
          },

          data: {
            status: "CONFIRMED",
          },

          include: {
            customer: true,
            items: true,
          },
        });

      return confirmed;
    },
    {
      maxWait: 10000,
      timeout: 20000,
    }
  );
}

export async function cancelChallan(
  challanId: string
) {
  const challan =
    await prisma.challan.findUnique({
      where: {
        id: challanId,
      },
    });

  if (!challan) {
    throw new Error("Challan not found");
  }

  if (challan.status !== "DRAFT") {
    throw new Error(
      `Only DRAFT challans can be cancelled. Current status: ${challan.status}`
    );
  }

  return prisma.challan.update({
    where: {
      id: challanId,
    },

    data: {
      status: "CANCELLED",
    },

    include: {
      customer: true,
      items: true,
    },
  });
}