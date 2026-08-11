import prisma from "../lib/prisma";

// Per-business in-memory cache
const _caches = new Map<string, { data: any; ts: number }>();
const CACHE_TTL = 30 * 1000; // 30 seconds

function startOfDay(d: Date) {
  const t = new Date(d);
  t.setHours(0, 0, 0, 0);
  return t;
}

function addDays(d: Date, days: number) {
  const t = new Date(d);
  t.setDate(t.getDate() + days);
  return t;
}

// ── Business-scoped dashboard ─────────────────────────────────────────────

export async function getBusinessDashboardMetrics(businessId: string) {
  const cached = _caches.get(businessId);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.data;
  }

  const [totalCustomers, totalProducts, productStockSum, totalChallans, confirmedChallans] =
    await Promise.all([
      prisma.customer.count({ where: { businessId } }),
      prisma.product.count({ where: { businessId } }),
      prisma.product.aggregate({ _sum: { currentStock: true }, where: { businessId } }),
      prisma.challan.count({ where: { businessId } }),
      prisma.challan.count({ where: { businessId, status: "CONFIRMED" } }),
    ]);

  const totalInventoryUnits = productStockSum._sum.currentStock || 0;

  const now = new Date();
  const thirtyDaysAgo = addDays(now, -30);

  const unitsMovedThisMonthAgg = await prisma.challan.aggregate({
    _sum: { totalQuantity: true },
    where: { businessId, createdAt: { gte: thirtyDaysAgo }, status: "CONFIRMED" },
  });

  const unitsMovedThisMonth = unitsMovedThisMonthAgg._sum.totalQuantity || 0;

  // Weekly trend last 6 weeks
  const trend: number[] = [];
  for (let i = 5; i >= 0; i--) {
    const end = startOfDay(addDays(now, -i * 7));
    const start = startOfDay(addDays(end, -7));
    const agg = await prisma.challan.aggregate({
      _sum: { totalQuantity: true },
      where: { businessId, createdAt: { gte: start, lt: end }, status: "CONFIRMED" },
    });
    trend.push(agg._sum.totalQuantity || 0);
  }

  const prev30 = addDays(thirtyDaysAgo, -30);
  const newCustomersThis = await prisma.customer.count({ where: { businessId, createdAt: { gte: thirtyDaysAgo } } });
  const newCustomersPrev = await prisma.customer.count({ where: { businessId, createdAt: { gte: prev30, lt: thirtyDaysAgo } } });
  const newCustomerGrowth = newCustomersPrev
    ? Math.round(((newCustomersThis - newCustomersPrev) / newCustomersPrev) * 100)
    : 0;

  const confirmedRate = totalChallans ? confirmedChallans / totalChallans : 0;
  const operationalHealth = Math.min(5, Math.round((1 + confirmedRate * 4) * 10) / 10);

  // Low stock count
  const lowStockProducts = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*) as count FROM "Product"
    WHERE "businessId" = ${businessId} AND "currentStock" <= "minimumStock"
  `;
  const lowStockCount = Number(lowStockProducts[0]?.count ?? 0);

  const data = {
    totalCustomers,
    totalProducts,
    totalInventoryUnits,
    unitsMovedThisMonth,
    trend,
    newCustomerGrowth,
    operationalHealth,
    confirmedChallans,
    totalChallans,
    lowStockCount,
  };

  _caches.set(businessId, { data, ts: Date.now() });
  return data;
}

export function clearDashboardCache(businessId: string) {
  _caches.delete(businessId);
}

// ── Platform dashboard (SUPER_ADMIN only) ────────────────────────────────

export async function getPlatformDashboardMetrics() {
  const [totalBusinesses, activeBusinesses, suspendedBusinesses, totalUsers, totalChallans, totalProducts] =
    await Promise.all([
      prisma.business.count(),
      prisma.business.count({ where: { status: "ACTIVE" } }),
      prisma.business.count({ where: { status: "SUSPENDED" } }),
      prisma.user.count(),
      prisma.challan.count(),
      prisma.product.count(),
    ]);

  const recentBusinesses = await prisma.business.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      users: {
        where: { role: "BUSINESS_ADMIN" },
        select: { id: true, name: true, email: true },
        take: 1,
      },
    },
  });

  return {
    totalBusinesses,
    activeBusinesses,
    suspendedBusinesses,
    totalUsers,
    totalChallans,
    totalProducts,
    recentBusinesses,
  };
}

export default { getBusinessDashboardMetrics, clearDashboardCache, getPlatformDashboardMetrics };
