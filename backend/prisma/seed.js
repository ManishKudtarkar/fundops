"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error("DATABASE_URL is not defined");
}
const adapter = new adapter_pg_1.PrismaPg({
    connectionString,
});
const prisma = new client_1.PrismaClient({
    adapter,
});
async function main() {
    const password = await bcryptjs_1.default.hash("Password@123", 10);
    const DEFAULT_BUSINESS_ID = "00000000-0000-0000-0000-000000000001";
    // Create or get default business
    const business = await prisma.business.upsert({
        where: { id: DEFAULT_BUSINESS_ID },
        update: {},
        create: {
            id: DEFAULT_BUSINESS_ID,
            name: "ABC Traders",
            status: "ACTIVE",
        },
    });
    // Create SUPER_ADMIN
    await prisma.user.upsert({
        where: { email: "demo.admin@fundops.local" },
        update: {
            password,
            name: "Demo Administrator",
            role: "SUPER_ADMIN",
            businessId: null, // SUPER_ADMIN has no businessId
        },
        create: {
            name: "Demo Administrator",
            email: "demo.admin@fundops.local",
            password,
            role: "SUPER_ADMIN",
            businessId: null,
            isActive: true,
        },
    });
    // Create business users
    const businessUsers = [
        {
            name: "ABC Business Admin",
            email: "abc.admin@fundops.local",
            role: "BUSINESS_ADMIN",
        },
        {
            name: "Sales Team",
            email: "sales@abc.local",
            role: "SALES",
        },
        {
            name: "Warehouse Team",
            email: "warehouse@abc.local",
            role: "WAREHOUSE",
        },
        {
            name: "Accounts Team",
            email: "accounts@abc.local",
            role: "ACCOUNTS",
        },
    ];
    for (const user of businessUsers) {
        await prisma.user.upsert({
            where: { email: user.email },
            update: {
                password,
                name: user.name,
                role: user.role,
                businessId: DEFAULT_BUSINESS_ID,
            },
            create: {
                name: user.name,
                email: user.email,
                password,
                role: user.role,
                businessId: DEFAULT_BUSINESS_ID,
                isActive: true,
            },
        });
    }
    console.log("Seed users and business created successfully.");
}
main()
    .catch((error) => {
    console.error(error);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map