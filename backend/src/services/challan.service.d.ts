export declare function createChallan(businessId: string, customerId: string, items: {
    productId: string;
    quantity: number;
}[], createdById: string): Promise<{
    customer: {
        id: string;
        email: string | null;
        businessId: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        address: string;
        status: import(".prisma/client").$Enums.CustomerStatus;
        businessName: string;
        mobile: string;
        gstNumber: string | null;
        customerType: import(".prisma/client").$Enums.CustomerType;
        followUpDate: Date | null;
        notes: string | null;
        createdById: string;
    };
    items: {
        id: string;
        sku: string;
        unitPrice: import("@prisma/client-runtime-utils").Decimal;
        quantity: number;
        productId: string;
        productName: string;
        challanId: string;
    }[];
} & {
    id: string;
    businessId: string;
    createdAt: Date;
    updatedAt: Date;
    status: import(".prisma/client").$Enums.ChallanStatus;
    createdById: string;
    totalQuantity: number;
    customerId: string;
    challanNumber: string;
}>;
export declare function createChallanAndClearCache(businessId: string, customerId: string, items: {
    productId: string;
    quantity: number;
}[], createdById: string): Promise<{
    customer: {
        id: string;
        email: string | null;
        businessId: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        address: string;
        status: import(".prisma/client").$Enums.CustomerStatus;
        businessName: string;
        mobile: string;
        gstNumber: string | null;
        customerType: import(".prisma/client").$Enums.CustomerType;
        followUpDate: Date | null;
        notes: string | null;
        createdById: string;
    };
    items: {
        id: string;
        sku: string;
        unitPrice: import("@prisma/client-runtime-utils").Decimal;
        quantity: number;
        productId: string;
        productName: string;
        challanId: string;
    }[];
} & {
    id: string;
    businessId: string;
    createdAt: Date;
    updatedAt: Date;
    status: import(".prisma/client").$Enums.ChallanStatus;
    createdById: string;
    totalQuantity: number;
    customerId: string;
    challanNumber: string;
}>;
export declare function getChallans(businessId: string, page?: number, limit?: number): Promise<{
    challans: ({
        createdBy: {
            id: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
        };
        customer: {
            id: string;
            email: string | null;
            businessId: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            address: string;
            status: import(".prisma/client").$Enums.CustomerStatus;
            businessName: string;
            mobile: string;
            gstNumber: string | null;
            customerType: import(".prisma/client").$Enums.CustomerType;
            followUpDate: Date | null;
            notes: string | null;
            createdById: string;
        };
        items: {
            id: string;
            sku: string;
            unitPrice: import("@prisma/client-runtime-utils").Decimal;
            quantity: number;
            productId: string;
            productName: string;
            challanId: string;
        }[];
    } & {
        id: string;
        businessId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ChallanStatus;
        createdById: string;
        totalQuantity: number;
        customerId: string;
        challanNumber: string;
    })[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;
export declare function getChallanById(id: string, businessId: string): Promise<{
    createdBy: {
        id: string;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
    };
    customer: {
        id: string;
        email: string | null;
        businessId: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        address: string;
        status: import(".prisma/client").$Enums.CustomerStatus;
        businessName: string;
        mobile: string;
        gstNumber: string | null;
        customerType: import(".prisma/client").$Enums.CustomerType;
        followUpDate: Date | null;
        notes: string | null;
        createdById: string;
    };
    items: ({
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
    } & {
        id: string;
        sku: string;
        unitPrice: import("@prisma/client-runtime-utils").Decimal;
        quantity: number;
        productId: string;
        productName: string;
        challanId: string;
    })[];
} & {
    id: string;
    businessId: string;
    createdAt: Date;
    updatedAt: Date;
    status: import(".prisma/client").$Enums.ChallanStatus;
    createdById: string;
    totalQuantity: number;
    customerId: string;
    challanNumber: string;
}>;
export declare function confirmChallan(challanId: string, businessId: string, createdById: string): Promise<{
    customer: {
        id: string;
        email: string | null;
        businessId: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        address: string;
        status: import(".prisma/client").$Enums.CustomerStatus;
        businessName: string;
        mobile: string;
        gstNumber: string | null;
        customerType: import(".prisma/client").$Enums.CustomerType;
        followUpDate: Date | null;
        notes: string | null;
        createdById: string;
    };
    items: {
        id: string;
        sku: string;
        unitPrice: import("@prisma/client-runtime-utils").Decimal;
        quantity: number;
        productId: string;
        productName: string;
        challanId: string;
    }[];
} & {
    id: string;
    businessId: string;
    createdAt: Date;
    updatedAt: Date;
    status: import(".prisma/client").$Enums.ChallanStatus;
    createdById: string;
    totalQuantity: number;
    customerId: string;
    challanNumber: string;
}>;
export declare function cancelChallan(challanId: string, businessId: string): Promise<{
    customer: {
        id: string;
        email: string | null;
        businessId: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        address: string;
        status: import(".prisma/client").$Enums.CustomerStatus;
        businessName: string;
        mobile: string;
        gstNumber: string | null;
        customerType: import(".prisma/client").$Enums.CustomerType;
        followUpDate: Date | null;
        notes: string | null;
        createdById: string;
    };
    items: {
        id: string;
        sku: string;
        unitPrice: import("@prisma/client-runtime-utils").Decimal;
        quantity: number;
        productId: string;
        productName: string;
        challanId: string;
    }[];
} & {
    id: string;
    businessId: string;
    createdAt: Date;
    updatedAt: Date;
    status: import(".prisma/client").$Enums.ChallanStatus;
    createdById: string;
    totalQuantity: number;
    customerId: string;
    challanNumber: string;
}>;
export declare function deleteChallan(challanId: string, businessId: string): Promise<{
    id: string;
    businessId: string;
    createdAt: Date;
    updatedAt: Date;
    status: import(".prisma/client").$Enums.ChallanStatus;
    createdById: string;
    totalQuantity: number;
    customerId: string;
    challanNumber: string;
}>;
//# sourceMappingURL=challan.service.d.ts.map