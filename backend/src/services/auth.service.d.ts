export declare function loginUser(email: string, password: string): Promise<{
    token: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        businessId: string;
        businessName: string;
    };
}>;
//# sourceMappingURL=auth.service.d.ts.map