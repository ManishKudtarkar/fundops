interface CustomerFilters {
    businessId: string;
    search?: string;
    status?: "LEAD" | "ACTIVE" | "INACTIVE";
    customerType?: "RETAIL" | "WHOLESALE" | "DISTRIBUTOR";
    page?: number;
    limit?: number;
}
export declare function createCustomer(data: any, userId: string, businessId: string): Promise<{
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
}>;
export declare function getCustomers(filters: CustomerFilters): Promise<{
    customers: {
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
    }[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;
export declare function getCustomerById(id: string, businessId: string): Promise<{
    challans: {
        id: string;
        businessId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ChallanStatus;
        createdById: string;
        totalQuantity: number;
        customerId: string;
        challanNumber: string;
    }[];
} & {
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
}>;
export declare function updateCustomer(id: string, businessId: string, data: any): Promise<{
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
}>;
export declare function deleteCustomer(id: string, businessId: string): Promise<{
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
}>;
export declare function addFollowUp(id: string, businessId: string, notes: string, followUpDate?: string): Promise<{
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
}>;
export {};
//# sourceMappingURL=customer.service.d.ts.map