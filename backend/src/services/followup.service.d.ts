export interface FollowUpFilters {
    businessId: string;
    status?: "PENDING" | "COMPLETED" | "CANCELLED";
    customerId?: string;
    assignedTo?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
}
export declare function createFollowUp(businessId: string, customerId: string, data: {
    title: string;
    notes?: string;
    followUpDate: string;
    assignedTo?: string;
}, createdBy: string): Promise<{
    customer: {
        id: string;
        email: string;
        name: string;
        mobile: string;
    };
    assignedToUser: {
        id: string;
        email: string;
        name: string;
    };
    createdByUser: {
        id: string;
        email: string;
        name: string;
    };
} & {
    id: string;
    businessId: string;
    createdAt: Date;
    updatedAt: Date;
    status: import(".prisma/client").$Enums.FollowUpStatus;
    followUpDate: Date;
    notes: string | null;
    createdBy: string;
    customerId: string;
    title: string;
    assignedTo: string | null;
}>;
export declare function getFollowUps(filters: FollowUpFilters): Promise<{
    followUps: ({
        customer: {
            id: string;
            email: string;
            name: string;
            mobile: string;
        };
        assignedToUser: {
            id: string;
            email: string;
            name: string;
        };
        createdByUser: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        businessId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.FollowUpStatus;
        followUpDate: Date;
        notes: string | null;
        createdBy: string;
        customerId: string;
        title: string;
        assignedTo: string | null;
    })[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;
export declare function getFollowUpById(id: string, businessId: string): Promise<{
    customer: {
        id: string;
        email: string;
        name: string;
        mobile: string;
    };
    assignedToUser: {
        id: string;
        email: string;
        name: string;
    };
    createdByUser: {
        id: string;
        email: string;
        name: string;
    };
} & {
    id: string;
    businessId: string;
    createdAt: Date;
    updatedAt: Date;
    status: import(".prisma/client").$Enums.FollowUpStatus;
    followUpDate: Date;
    notes: string | null;
    createdBy: string;
    customerId: string;
    title: string;
    assignedTo: string | null;
}>;
export declare function updateFollowUp(id: string, businessId: string, data: {
    title?: string;
    notes?: string;
    followUpDate?: string;
    assignedTo?: string;
    status?: "PENDING" | "COMPLETED" | "CANCELLED";
}): Promise<{
    customer: {
        id: string;
        email: string;
        name: string;
        mobile: string;
    };
    assignedToUser: {
        id: string;
        email: string;
        name: string;
    };
    createdByUser: {
        id: string;
        email: string;
        name: string;
    };
} & {
    id: string;
    businessId: string;
    createdAt: Date;
    updatedAt: Date;
    status: import(".prisma/client").$Enums.FollowUpStatus;
    followUpDate: Date;
    notes: string | null;
    createdBy: string;
    customerId: string;
    title: string;
    assignedTo: string | null;
}>;
export declare function getDashboardFollowUps(businessId: string): Promise<{
    today: ({
        customer: {
            id: string;
            name: string;
        };
        assignedToUser: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        businessId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.FollowUpStatus;
        followUpDate: Date;
        notes: string | null;
        createdBy: string;
        customerId: string;
        title: string;
        assignedTo: string | null;
    })[];
    overdue: ({
        customer: {
            id: string;
            name: string;
        };
        assignedToUser: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        businessId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.FollowUpStatus;
        followUpDate: Date;
        notes: string | null;
        createdBy: string;
        customerId: string;
        title: string;
        assignedTo: string | null;
    })[];
    upcoming: ({
        customer: {
            id: string;
            name: string;
        };
        assignedToUser: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        businessId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.FollowUpStatus;
        followUpDate: Date;
        notes: string | null;
        createdBy: string;
        customerId: string;
        title: string;
        assignedTo: string | null;
    })[];
}>;
export declare function deleteFollowUp(id: string, businessId: string): Promise<{
    id: string;
    businessId: string;
    createdAt: Date;
    updatedAt: Date;
    status: import(".prisma/client").$Enums.FollowUpStatus;
    followUpDate: Date;
    notes: string | null;
    createdBy: string;
    customerId: string;
    title: string;
    assignedTo: string | null;
}>;
//# sourceMappingURL=followup.service.d.ts.map