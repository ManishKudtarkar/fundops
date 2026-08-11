import prisma from "../lib/prisma";

export type AuditAction =
  | "LOGIN"
  | "LOGOUT"
  | "CREATE_CUSTOMER"
  | "UPDATE_CUSTOMER"
  | "DELETE_CUSTOMER"
  | "CREATE_PRODUCT"
  | "UPDATE_PRODUCT"
  | "DELETE_PRODUCT"
  | "STOCK_IN"
  | "STOCK_OUT"
  | "STOCK_ADJUSTMENT"
  | "CREATE_CHALLAN"
  | "CONFIRM_CHALLAN"
  | "CANCEL_CHALLAN"
  | "DELETE_CHALLAN"
  | "CREATE_USER"
  | "UPDATE_USER"
  | "ROLE_CHANGE"
  | "CREATE_FOLLOWUP"
  | "UPDATE_FOLLOWUP"
  | "DELETE_FOLLOWUP"
  | "BUSINESS_CREATED"
  | "BUSINESS_SUSPENDED"
  | "BUSINESS_ACTIVATED";

export interface AuditLogEntry {
  businessId?: string;
  userId: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
}

export async function createAuditLog(entry: AuditLogEntry) {
  return prisma.auditLog.create({
    data: {
      businessId: entry.businessId || null,
      userId: entry.userId,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      metadata: entry.metadata || {},
      ipAddress: entry.ipAddress || null,
    },
  });
}

export interface AuditLogFilters {
  businessId?: string;
  userId?: string;
  action?: AuditAction;
  entityType?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export async function getAuditLogs(filters: AuditLogFilters) {
  const page = filters.page || 1;
  const limit = filters.limit || 50;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (filters.businessId) {
    where.businessId = filters.businessId;
  }

  if (filters.userId) {
    where.userId = filters.userId;
  }

  if (filters.action) {
    where.action = filters.action;
  }

  if (filters.entityType) {
    where.entityType = filters.entityType;
  }

  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) {
      where.createdAt.gte = new Date(filters.dateFrom);
    }
    if (filters.dateTo) {
      const end = new Date(filters.dateTo);
      end.setHours(23, 59, 59, 999);
      where.createdAt.lte = end;
    }
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getBusinessAuditLogs(businessId: string, page = 1, limit = 50) {
  return getAuditLogs({
    businessId,
    page,
    limit,
  });
}

export async function getUserAuditLogs(userId: string, page = 1, limit = 50) {
  return getAuditLogs({
    userId,
    page,
    limit,
  });
}

// Audit log entry helpers
export async function auditLogin(userId: string, ipAddress?: string) {
  return createAuditLog({
    userId,
    action: "LOGIN",
    entityType: "USER",
    entityId: userId,
    ipAddress,
  });
}

export async function auditLogout(userId: string, ipAddress?: string) {
  return createAuditLog({
    userId,
    action: "LOGOUT",
    entityType: "USER",
    entityId: userId,
    ipAddress,
  });
}

export async function auditCustomerAction(
  businessId: string,
  userId: string,
  action: "CREATE_CUSTOMER" | "UPDATE_CUSTOMER" | "DELETE_CUSTOMER",
  customerId: string,
  metadata?: Record<string, any>
) {
  return createAuditLog({
    businessId,
    userId,
    action,
    entityType: "CUSTOMER",
    entityId: customerId,
    metadata,
  });
}

export async function auditProductAction(
  businessId: string,
  userId: string,
  action: "CREATE_PRODUCT" | "UPDATE_PRODUCT" | "DELETE_PRODUCT",
  productId: string,
  metadata?: Record<string, any>
) {
  return createAuditLog({
    businessId,
    userId,
    action,
    entityType: "PRODUCT",
    entityId: productId,
    metadata,
  });
}

export async function auditStockMovement(
  businessId: string,
  userId: string,
  movementType: "STOCK_IN" | "STOCK_OUT" | "STOCK_ADJUSTMENT",
  movementId: string,
  metadata?: Record<string, any>
) {
  return createAuditLog({
    businessId,
    userId,
    action: movementType,
    entityType: "STOCK_MOVEMENT",
    entityId: movementId,
    metadata,
  });
}

export async function auditChallanAction(
  businessId: string,
  userId: string,
  action: "CREATE_CHALLAN" | "CONFIRM_CHALLAN" | "CANCEL_CHALLAN" | "DELETE_CHALLAN",
  challanId: string,
  metadata?: Record<string, any>
) {
  return createAuditLog({
    businessId,
    userId,
    action,
    entityType: "CHALLAN",
    entityId: challanId,
    metadata,
  });
}

export async function auditUserAction(
  businessId: string,
  userId: string,
  action: "CREATE_USER" | "UPDATE_USER" | "ROLE_CHANGE",
  targetUserId: string,
  metadata?: Record<string, any>
) {
  return createAuditLog({
    businessId,
    userId,
    action,
    entityType: "USER",
    entityId: targetUserId,
    metadata,
  });
}

export async function auditBusinessAction(
  userId: string,
  action: "BUSINESS_CREATED" | "BUSINESS_SUSPENDED" | "BUSINESS_ACTIVATED",
  businessId: string,
  metadata?: Record<string, any>
) {
  return createAuditLog({
    businessId,
    userId,
    action,
    entityType: "BUSINESS",
    entityId: businessId,
    metadata,
  });
}
