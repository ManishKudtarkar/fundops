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

  const users = [
    {
      name: "System Administrator",
      email: "admin@fundops.com",
      role: "ADMIN" as const,
    },
    {
      name: "Sales User",
      email: "sales@fundops.com",
      role: "SALES" as const,
    },
    {
      name: "Warehouse User",
      email: "warehouse@fundops.com",
      role: "WAREHOUSE" as const,
    },
    {
      name: "Accounts User",
      email: "accounts@fundops.com",
      role: "ACCOUNTS" as const,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: {
        email: user.email,
      },
      update: {
        password,
        name: user.name,
        role: user.role,
      },
      create: {
        name: user.name,
        email: user.email,
        password,
        role: user.role,
      },
    });
  }

  console.log("Seed users created successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });