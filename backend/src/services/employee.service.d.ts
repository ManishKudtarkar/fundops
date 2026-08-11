export declare function getEmployees(businessId: string): Promise<{
    id: string;
    email: string;
    name: string;
    role: import(".prisma/client").$Enums.Role;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}[]>;
export declare function getEmployeeById(id: string, businessId: string): Promise<{
    id: string;
    email: string;
    name: string;
    role: import(".prisma/client").$Enums.Role;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function createEmployee(businessId: string, data: {
    name: string;
    email: string;
    password: string;
    role: string;
}): Promise<{
    id: string;
    email: string;
    name: string;
    role: import(".prisma/client").$Enums.Role;
    isActive: boolean;
    createdAt: Date;
}>;
export declare function updateEmployee(id: string, businessId: string, data: {
    name?: string;
    role?: string;
    isActive?: boolean;
}): Promise<{
    id: string;
    email: string;
    name: string;
    role: import(".prisma/client").$Enums.Role;
    isActive: boolean;
    updatedAt: Date;
}>;
export declare function resetEmployeePassword(id: string, businessId: string, newPassword: string): Promise<{
    id: string;
    email: string;
    name: string;
}>;
//# sourceMappingURL=employee.service.d.ts.map