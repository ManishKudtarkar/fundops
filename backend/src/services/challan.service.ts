import prisma from "../lib/prisma";
import { clearDashboardCache } from "./dashboard.service";
import { randomUUID } from "crypto";

function generateChallanNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = randomUUID().replace(/-/g, "").substring(0, 8).toUpperCase();
  return `CH-${year}${month}${day}-${random}`;
}

export async function createChallan(
  businessId: string,
  customerId: string,
  items: { productId: string; quantity: number }[],
  createdById: string
) {
  return prisma.$transaction(
    async (tx) => {
      // Verify customer belongs to THIS business
      const customer = await tx.customer.findFirst({
        where: { id: customerId, businessId },
      });

      if (!customer) {
        throw new Error("Customer not found");
      }

      // Prevent duplicate products
      const productIds = items.map((item) => item.productId);
      if (new Set(productIds).size !== productIds.length) {
        throw new Error("A product cannot appear more than once in a challan");
      }

      // Verify ALL products belong to THIS business (prevent cross-business attack)
      const products = await tx.product.findMany({
        where: { id: { in: productIds }, businessId },
      });

      if (products.length !== productIds.length) {
        throw new Error("One or more products not found");
      }

      const productMap = new Map(products.map((p) => [p.id, p]));

      const challanItems = items.map((item) => {
        const product = productMap.get(item.productId);
        if (!product) throw new Error("Product not found");
        return {
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          unitPrice: product.unitPrice,
          quantity: item.quantity,
        };
      });

      const totalQuantity = items.reduce((total, item) => total + item.quantity, 0);

      const challan = await tx.challan.create({
        data: {
          businessId,
          challanNumber: generateChallanNumber(),
          customerId,
          totalQuantity,
          status: "DRAFT",
          createdById,
          items: { create: challanItems },
        },
        include: { customer: true, items: true },
      });

      return challan;
    },
    { maxWait: 10000, timeout: 20000 }
  );
}

export async function createChallanAndClearCache(
  businessId: string,
  customerId: string,
  items: { productId: string; quantity: number }[],
  createdById: string
) {
  const res = await createChallan(businessId, customerId, items, createdById);
  try { clearDashboardCache(businessId); } catch (_) {}
  return res;
}

export async function getChallans(businessId: string, page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  const [challans, total] = await Promise.all([
    prisma.challan.findMany({
      where: { businessId }, // ALWAYS scoped
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        customer: true,
        items: true,
        createdBy: { select: { id: true, name: true, email: true, role: true } },
      },
    }),
    prisma.challan.count({ where: { businessId } }),
  ]);

  return {
    challans,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getChallanById(id: string, businessId: string) {
  return prisma.challan.findFirst({
    where: { id, businessId }, // IDOR protection
    include: {
      customer: true,
      items: { include: { product: true } },
      createdBy: { select: { id: true, name: true, email: true, role: true } },
    },
  });
}

export async function confirmChallan(challanId: string, businessId: string, createdById: string) {
  const confirmed = await prisma.$transaction(
    async (tx) => {
      // Find challan AND verify it belongs to this business
      const challan = await tx.challan.findFirst({
        where: { id: challanId, businessId },
        include: { items: true },
      });

      if (!challan) {
        throw new Error("Challan not found");
      }

      if (challan.status !== "DRAFT") {
        throw new Error(`Only DRAFT challans can be confirmed. Current status: ${challan.status}`);
      }

      // Validate all items — check product ownership AND stock
      const stockErrors: string[] = [];
      const productStockMap = new Map<string, number>();

      for (const item of challan.items) {
        // Verify product belongs to this business (prevent cross-business attack)
        const product = await tx.product.findFirst({
          where: { id: item.productId, businessId },
        });

        if (!product) {
          stockErrors.push(`Product not found: ${item.productName}`);
          continue;
        }

        productStockMap.set(item.productId, product.currentStock);

        if (product.currentStock < item.quantity) {
          stockErrors.push(
            `Insufficient stock for ${item.productName}. Available: ${product.currentStock}, Requested: ${item.quantity}`
          );
        }
      }

      if (stockErrors.length > 0) {
        throw new Error(stockErrors.join(" | "));
      }

      // All validated — deduct stock and record movements
      for (const item of challan.items) {
        const previousStock = productStockMap.get(item.productId) ?? 0;
        const newStock = previousStock - item.quantity;

        await tx.product.update({
          where: { id: item.productId },
          data: { currentStock: newStock },
        });

        await tx.stockMovement.create({
          data: {
            businessId,
            productId: item.productId,
            quantity: item.quantity,
            movementType: "OUT",
            previousStock,
            newStock,
            referenceType: "SALES_CHALLAN",
            referenceId: challan.id,
            reason: `Sales Challan ${challan.challanNumber}`,
            createdById,
          },
        });
      }

      const updated = await tx.challan.update({
        where: { id: challanId },
        data: { status: "CONFIRMED" },
        include: { customer: true, items: true },
      });

      return updated;
    },
    { maxWait: 10000, timeout: 20000 }
  );

  try { clearDashboardCache(businessId); } catch (_) {}
  return confirmed;
}

export async function cancelChallan(challanId: string, businessId: string) {
  const challan = await prisma.challan.findFirst({
    where: { id: challanId, businessId },
  });

  if (!challan) {
    throw new Error("Challan not found");
  }

  if (challan.status !== "DRAFT") {
    throw new Error(`Only DRAFT challans can be cancelled. Current status: ${challan.status}`);
  }

  const updated = await prisma.challan.update({
    where: { id: challanId },
    data: { status: "CANCELLED" },
    include: { customer: true, items: true },
  });

  try { clearDashboardCache(businessId); } catch (_) {}
  return updated;
}

export async function deleteChallan(challanId: string, businessId: string) {
  const challan = await prisma.challan.findFirst({
    where: { id: challanId, businessId },
  });

  if (!challan) {
    throw new Error("Challan not found");
  }

  if (challan.status !== "DRAFT") {
    throw new Error(`Only DRAFT challans can be deleted. Current status: ${challan.status}`);
  }

  const deleted = await prisma.challan.delete({ where: { id: challanId } });
  try { clearDashboardCache(businessId); } catch (_) {}
  return deleted;
}
