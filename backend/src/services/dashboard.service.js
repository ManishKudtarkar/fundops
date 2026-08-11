"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBusinessDashboardMetrics = getBusinessDashboardMetrics;
exports.clearDashboardCache = clearDashboardCache;
exports.getPlatformDashboardMetrics = getPlatformDashboardMetrics;
const prisma_1 = __importDefault(require("../lib/prisma"));
// Per-business in-memory cache
const _caches = new Map();
const CACHE_TTL = 30 * 1000; // 30 seconds
function startOfDay(d) {
    const t = new Date(d);
    t.setHours(0, 0, 0, 0);
    return t;
}
function addDays(d, days) {
    const t = new Date(d);
    t.setDate(t.getDate() + days);
    return t;
}
// ── Business-scoped dashboard ─────────────────────────────────────────────
async function getBusinessDashboardMetrics(businessId) {
    const cached = _caches.get(businessId);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
        return cached.data;
    }
    const [totalCustomers, totalProducts, productStockSum, totalChallans, confirmedChallans] = await Promise.all([
        prisma_1.default.customer.count({ where: { businessId } }),
        prisma_1.default.product.count({ where: { businessId } }),
        prisma_1.default.product.aggregate({ _sum: { currentStock: true }, where: { businessId } }),
        prisma_1.default.challan.count({ where: { businessId } }),
        prisma_1.default.challan.count({ where: { businessId, status: "CONFIRMED" } }),
    ]);
    const totalInventoryUnits = productStockSum._sum.currentStock || 0;
    const now = new Date();
    const thirtyDaysAgo = addDays(now, -30);
    const unitsMovedThisMonthAgg = await prisma_1.default.challan.aggregate({
        _sum: { totalQuantity: true },
        where: { businessId, createdAt: { gte: thirtyDaysAgo }, status: "CONFIRMED" },
    });
    const unitsMovedThisMonth = unitsMovedThisMonthAgg._sum.totalQuantity || 0;
    // Weekly trend last 6 weeks
    const trend = [];
    for (let i = 5; i >= 0; i--) {
        const end = startOfDay(addDays(now, -i * 7));
        const start = startOfDay(addDays(end, -7));
        const agg = await prisma_1.default.challan.aggregate({
            _sum: { totalQuantity: true },
            where: { businessId, createdAt: { gte: start, lt: end }, status: "CONFIRMED" },
        });
        trend.push(agg._sum.totalQuantity || 0);
    }
    const prev30 = addDays(thirtyDaysAgo, -30);
    const newCustomersThis = await prisma_1.default.customer.count({ where: { businessId, createdAt: { gte: thirtyDaysAgo } } });
    const newCustomersPrev = await prisma_1.default.customer.count({ where: { businessId, createdAt: { gte: prev30, lt: thirtyDaysAgo } } });
    const newCustomerGrowth = newCustomersPrev
        ? Math.round(((newCustomersThis - newCustomersPrev) / newCustomersPrev) * 100)
        : 0;
    const confirmedRate = totalChallans ? confirmedChallans / totalChallans : 0;
    const operationalHealth = Math.min(5, Math.round((1 + confirmedRate * 4) * 10) / 10);
    // Low stock count
    const lowStockProducts = await prisma_1.default.$queryRaw `
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
function clearDashboardCache(businessId) {
    _caches.delete(businessId);
}
// ── Platform dashboard (SUPER_ADMIN only) ────────────────────────────────
async function getPlatformDashboardMetrics() {
    const [totalBusinesses, activeBusinesses, suspendedBusinesses, totalUsers, totalChallans, totalProducts] = await Promise.all([
        prisma_1.default.business.count(),
        prisma_1.default.business.count({ where: { status: "ACTIVE" } }),
        prisma_1.default.business.count({ where: { status: "SUSPENDED" } }),
        prisma_1.default.user.count(),
        prisma_1.default.challan.count(),
        prisma_1.default.product.count(),
    ]);
    const recentBusinesses = await prisma_1.default.business.findMany({
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
exports.default = { getBusinessDashboardMetrics, clearDashboardCache, getPlatformDashboardMetrics };
//# sourceMappingURL=dashboard.service.js.map