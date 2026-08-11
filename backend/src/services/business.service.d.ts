export interface CreateBusinessInput {
    name: string;
    legalName?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    gstin?: string;
    adminName: string;
    adminEmail: string;
    adminPassword: string;
}
export declare function createBusiness(input: CreateBusinessInput): Promise<{
    business: {
        id: string;
        email: string | null;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        legalName: string | null;
        phone: string | null;
        address: string | null;
        city: string | null;
        state: string | null;
        country: string | null;
        postalCode: string | null;
        gstin: string | null;
        logoUrl: string | null;
        status: import(".prisma/client").$Enums.BusinessStatus;
        settings: import("@prisma/client/runtime/client").JsonValue | null;
    };
    admin: {
        id: string;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
    };
}>;
export declare function getBusinesses(page?: number, limit?: number): Promise<{
    businesses: ({
        users: {
            id: string;
            email: string;
            name: string;
        }[];
        _count: {
            customers: number;
            challans: number;
            users: number;
            products: number;
        };
    } & {
        id: string;
        email: string | null;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        legalName: string | null;
        phone: string | null;
        address: string | null;
        city: string | null;
        state: string | null;
        country: string | null;
        postalCode: string | null;
        gstin: string | null;
        logoUrl: string | null;
        status: import(".prisma/client").$Enums.BusinessStatus;
        settings: import("@prisma/client/runtime/client").JsonValue | null;
    })[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;
export declare function getBusinessById(id: string): Promise<{
    users: {
        id: string;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        isActive: boolean;
        createdAt: Date;
    }[];
    _count: {
        customers: number;
        challans: number;
        users: number;
        products: number;
    };
} & {
    id: string;
    email: string | null;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    legalName: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    postalCode: string | null;
    gstin: string | null;
    logoUrl: string | null;
    status: import(".prisma/client").$Enums.BusinessStatus;
    settings: import("@prisma/client/runtime/client").JsonValue | null;
}>;
export declare function updateBusiness(id: string, data: Partial<Omit<CreateBusinessInput, "adminName" | "adminEmail" | "adminPassword">>): Promise<{
    id: string;
    email: string | null;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    legalName: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    postalCode: string | null;
    gstin: string | null;
    logoUrl: string | null;
    status: import(".prisma/client").$Enums.BusinessStatus;
    settings: import("@prisma/client/runtime/client").JsonValue | null;
}>;
export declare function setBusinessStatus(id: string, status: "ACTIVE" | "SUSPENDED" | "INACTIVE"): Promise<{
    id: string;
    email: string | null;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    legalName: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    postalCode: string | null;
    gstin: string | null;
    logoUrl: string | null;
    status: import(".prisma/client").$Enums.BusinessStatus;
    settings: import("@prisma/client/runtime/client").JsonValue | null;
}>;
//# sourceMappingURL=business.service.d.ts.map