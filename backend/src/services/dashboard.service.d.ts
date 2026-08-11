export declare function getBusinessDashboardMetrics(businessId: string): Promise<any>;
export declare function clearDashboardCache(businessId: string): void;
export declare function getPlatformDashboardMetrics(): Promise<{
    totalBusinesses: number;
    activeBusinesses: number;
    suspendedBusinesses: number;
    totalUsers: number;
    totalChallans: number;
    totalProducts: number;
    recentBusinesses: ({
        users: {
            id: string;
            email: string;
            name: string;
        }[];
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
}>;
declare const _default: {
    getBusinessDashboardMetrics: typeof getBusinessDashboardMetrics;
    clearDashboardCache: typeof clearDashboardCache;
    getPlatformDashboardMetrics: typeof getPlatformDashboardMetrics;
};
export default _default;
//# sourceMappingURL=dashboard.service.d.ts.map