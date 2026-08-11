export type AuditAction = "LOGIN" | "LOGOUT" | "CREATE_CUSTOMER" | "UPDATE_CUSTOMER" | "DELETE_CUSTOMER" | "CREATE_PRODUCT" | "UPDATE_PRODUCT" | "DELETE_PRODUCT" | "STOCK_IN" | "STOCK_OUT" | "STOCK_ADJUSTMENT" | "CREATE_CHALLAN" | "CONFIRM_CHALLAN" | "CANCEL_CHALLAN" | "DELETE_CHALLAN" | "CREATE_USER" | "UPDATE_USER" | "ROLE_CHANGE" | "CREATE_FOLLOWUP" | "UPDATE_FOLLOWUP" | "DELETE_FOLLOWUP" | "BUSINESS_CREATED" | "BUSINESS_SUSPENDED" | "BUSINESS_ACTIVATED";
export interface AuditLogEntry {
    businessId?: string;
    userId: string;
    action: AuditAction;
    entityType: string;
    entityId: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
}
export declare function createAuditLog(entry: AuditLogEntry): Promise<{
    id: string;
    businessId: string | null;
    createdAt: Date;
    userId: string | null;
    action: import(".prisma/client").$Enums.AuditAction;
    entityType: string | null;
    entityId: string | null;
    metadata: import("@prisma/client/runtime/client").JsonValue | null;
    ipAddress: string | null;
}>;
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
export declare function getAuditLogs(filters: AuditLogFilters): Promise<{
    logs: ({
        user: {
            id: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
        };
    } & {
        id: string;
        businessId: string | null;
        createdAt: Date;
        userId: string | null;
        action: import(".prisma/client").$Enums.AuditAction;
        entityType: string | null;
        entityId: string | null;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        ipAddress: string | null;
    })[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;
export declare function getBusinessAuditLogs(businessId: string, page?: number, limit?: number): Promise<{
    logs: ({
        user: {
            id: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
        };
    } & {
        id: string;
        businessId: string | null;
        createdAt: Date;
        userId: string | null;
        action: import(".prisma/client").$Enums.AuditAction;
        entityType: string | null;
        entityId: string | null;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        ipAddress: string | null;
    })[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;
export declare function getUserAuditLogs(userId: string, page?: number, limit?: number): Promise<{
    logs: ({
        user: {
            id: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
        };
    } & {
        id: string;
        businessId: string | null;
        createdAt: Date;
        userId: string | null;
        action: import(".prisma/client").$Enums.AuditAction;
        entityType: string | null;
        entityId: string | null;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        ipAddress: string | null;
    })[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;
export declare function auditLogin(userId: string, ipAddress?: string): Promise<{
    id: string;
    businessId: string | null;
    createdAt: Date;
    userId: string | null;
    action: import(".prisma/client").$Enums.AuditAction;
    entityType: string | null;
    entityId: string | null;
    metadata: import("@prisma/client/runtime/client").JsonValue | null;
    ipAddress: string | null;
}>;
export declare function auditLogout(userId: string, ipAddress?: string): Promise<{
    id: string;
    businessId: string | null;
    createdAt: Date;
    userId: string | null;
    action: import(".prisma/client").$Enums.AuditAction;
    entityType: string | null;
    entityId: string | null;
    metadata: import("@prisma/client/runtime/client").JsonValue | null;
    ipAddress: string | null;
}>;
export declare function auditCustomerAction(businessId: string, userId: string, action: "CREATE_CUSTOMER" | "UPDATE_CUSTOMER" | "DELETE_CUSTOMER", customerId: string, metadata?: Record<string, any>): Promise<{
    id: string;
    businessId: string | null;
    createdAt: Date;
    userId: string | null;
    action: import(".prisma/client").$Enums.AuditAction;
    entityType: string | null;
    entityId: string | null;
    metadata: import("@prisma/client/runtime/client").JsonValue | null;
    ipAddress: string | null;
}>;
export declare function auditProductAction(businessId: string, userId: string, action: "CREATE_PRODUCT" | "UPDATE_PRODUCT" | "DELETE_PRODUCT", productId: string, metadata?: Record<string, any>): Promise<{
    id: string;
    businessId: string | null;
    createdAt: Date;
    userId: string | null;
    action: import(".prisma/client").$Enums.AuditAction;
    entityType: string | null;
    entityId: string | null;
    metadata: import("@prisma/client/runtime/client").JsonValue | null;
    ipAddress: string | null;
}>;
export declare function auditStockMovement(businessId: string, userId: string, movementType: "STOCK_IN" | "STOCK_OUT" | "STOCK_ADJUSTMENT", movementId: string, metadata?: Record<string, any>): Promise<{
    id: string;
    businessId: string | null;
    createdAt: Date;
    userId: string | null;
    action: import(".prisma/client").$Enums.AuditAction;
    entityType: string | null;
    entityId: string | null;
    metadata: import("@prisma/client/runtime/client").JsonValue | null;
    ipAddress: string | null;
}>;
export declare function auditChallanAction(businessId: string, userId: string, action: "CREATE_CHALLAN" | "CONFIRM_CHALLAN" | "CANCEL_CHALLAN" | "DELETE_CHALLAN", challanId: string, metadata?: Record<string, any>): Promise<{
    id: string;
    businessId: string | null;
    createdAt: Date;
    userId: string | null;
    action: import(".prisma/client").$Enums.AuditAction;
    entityType: string | null;
    entityId: string | null;
    metadata: import("@prisma/client/runtime/client").JsonValue | null;
    ipAddress: string | null;
}>;
export declare function auditUserAction(businessId: string, userId: string, action: "CREATE_USER" | "UPDATE_USER" | "ROLE_CHANGE", targetUserId: string, metadata?: Record<string, any>): Promise<{
    id: string;
    businessId: string | null;
    createdAt: Date;
    userId: string | null;
    action: import(".prisma/client").$Enums.AuditAction;
    entityType: string | null;
    entityId: string | null;
    metadata: import("@prisma/client/runtime/client").JsonValue | null;
    ipAddress: string | null;
}>;
export declare function auditBusinessAction(userId: string, action: "BUSINESS_CREATED" | "BUSINESS_SUSPENDED" | "BUSINESS_ACTIVATED", businessId: string, metadata?: Record<string, any>): Promise<{
    id: string;
    businessId: string | null;
    createdAt: Date;
    userId: string | null;
    action: import(".prisma/client").$Enums.AuditAction;
    entityType: string | null;
    entityId: string | null;
    metadata: import("@prisma/client/runtime/client").JsonValue | null;
    ipAddress: string | null;
}>;
//# sourceMappingURL=audit.service.d.ts.map