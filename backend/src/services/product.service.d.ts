interface ProductFilters {
    businessId: string;
    search?: string;
    category?: string;
    lowStock?: boolean;
    page?: number;
    limit?: number;
}
export declare function createProduct(data: any, businessId: string): Promise<{
    id: string;
    businessId: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    sku: string;
    category: string;
    unitPrice: import("@prisma/client-runtime-utils").Decimal;
    currentStock: number;
    minimumStock: number;
    location: string;
}>;
export declare function getProducts(filters: ProductFilters): Promise<{
    products: {
        id: string;
        businessId: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        sku: string;
        category: string;
        unitPrice: import("@prisma/client-runtime-utils").Decimal;
        currentStock: number;
        minimumStock: number;
        location: string;
    }[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;
export declare function getProductById(id: string, businessId: string): Promise<{
    stockMovements: {
        id: string;
        businessId: string;
        createdAt: Date;
        createdById: string;
        quantity: number;
        movementType: import(".prisma/client").$Enums.StockMovementType;
        reason: string;
        productId: string;
        previousStock: number;
        newStock: number;
        referenceType: import(".prisma/client").$Enums.ReferenceType;
        referenceId: string | null;
    }[];
} & {
    id: string;
    businessId: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    sku: string;
    category: string;
    unitPrice: import("@prisma/client-runtime-utils").Decimal;
    currentStock: number;
    minimumStock: number;
    location: string;
}>;
export declare function updateProduct(id: string, businessId: string, data: any): Promise<{
    id: string;
    businessId: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    sku: string;
    category: string;
    unitPrice: import("@prisma/client-runtime-utils").Decimal;
    currentStock: number;
    minimumStock: number;
    location: string;
}>;
export declare function createStockMovement(productId: string, businessId: string, quantity: number, movementType: "IN" | "OUT" | "ADJUSTMENT", reason: string, createdById: string, referenceType?: "SALES_CHALLAN" | "MANUAL" | "ADJUSTMENT", referenceId?: string): Promise<{
    product: {
        id: string;
        businessId: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        sku: string;
        category: string;
        unitPrice: import("@prisma/client-runtime-utils").Decimal;
        currentStock: number;
        minimumStock: number;
        location: string;
    };
    movement: {
        id: string;
        businessId: string;
        createdAt: Date;
        createdById: string;
        quantity: number;
        movementType: import(".prisma/client").$Enums.StockMovementType;
        reason: string;
        productId: string;
        previousStock: number;
        newStock: number;
        referenceType: import(".prisma/client").$Enums.ReferenceType;
        referenceId: string | null;
    };
}>;
export declare function createStockMovementAndClearCache(productId: string, businessId: string, quantity: number, movementType: "IN" | "OUT" | "ADJUSTMENT", reason: string, createdById: string, referenceType?: "SALES_CHALLAN" | "MANUAL" | "ADJUSTMENT", referenceId?: string): Promise<{
    product: {
        id: string;
        businessId: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        sku: string;
        category: string;
        unitPrice: import("@prisma/client-runtime-utils").Decimal;
        currentStock: number;
        minimumStock: number;
        location: string;
    };
    movement: {
        id: string;
        businessId: string;
        createdAt: Date;
        createdById: string;
        quantity: number;
        movementType: import(".prisma/client").$Enums.StockMovementType;
        reason: string;
        productId: string;
        previousStock: number;
        newStock: number;
        referenceType: import(".prisma/client").$Enums.ReferenceType;
        referenceId: string | null;
    };
}>;
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
export declare function getStockMovements(filters: MovementFilters): Promise<{
    movements: ({
        createdBy: {
            id: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
        };
        product: {
            id: string;
            name: string;
            sku: string;
            location: string;
        };
    } & {
        id: string;
        businessId: string;
        createdAt: Date;
        createdById: string;
        quantity: number;
        movementType: import(".prisma/client").$Enums.StockMovementType;
        reason: string;
        productId: string;
        previousStock: number;
        newStock: number;
        referenceType: import(".prisma/client").$Enums.ReferenceType;
        referenceId: string | null;
    })[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;
export {};
//# sourceMappingURL=product.service.d.ts.map