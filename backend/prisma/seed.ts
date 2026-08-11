import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const password = await bcrypt.hash("Password@123", 10);
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
      role: "BUSINESS_ADMIN" as const,
    },
    {
      name: "Sales Team",
      email: "sales@abc.local",
      role: "SALES" as const,
    },
    {
      name: "Warehouse Team",
      email: "warehouse@abc.local",
      role: "WAREHOUSE" as const,
    },
    {
      name: "Accounts Team",
      email: "accounts@abc.local",
      role: "ACCOUNTS" as const,
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