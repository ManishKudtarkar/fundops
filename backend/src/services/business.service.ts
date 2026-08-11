import prisma from "../lib/prisma";
import bcrypt from "bcryptjs";

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

export async function createBusiness(input: CreateBusinessInput) {
  // Hash password BEFORE any database operations to avoid timeouts
  const hashedPassword = await bcrypt.hash(input.adminPassword, 10);

  try {
    // Create the business first
    const business = await prisma.business.create({
      data: {
        name: input.name,
        legalName: input.legalName || null,
        email: input.email || null,
        phone: input.phone || null,
        address: input.address || null,
        city: input.city || null,
        state: input.state || null,
        country: input.country || null,
        postalCode: input.postalCode || null,
        gstin: input.gstin || null,
        status: "ACTIVE",
      },
    });

    // Create the business admin user
    const admin = await prisma.user.create({
      data: {
        businessId: business.id,
        name: input.adminName,
        email: input.adminEmail,
        password: hashedPassword,
        role: "BUSINESS_ADMIN",
        isActive: true,
      },
      select: { id: true, name: true, email: true, role: true },
    });

    return { business, admin };
  } catch (error) {
    // If user creation fails, try to clean up the business (best effort)
    if (error instanceof Error && error.message.includes("Unique constraint failed")) {
      throw new Error("Admin email already exists");
    }
    throw error;
  }
}

export async function getBusinesses(page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [businesses, total] = await Promise.all([
    prisma.business.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { users: true, customers: true, products: true, challans: true },
        },
        users: {
          where: { role: "BUSINESS_ADMIN" },
          select: { id: true, name: true, email: true },
          take: 1,
        },
      },
    }),
    prisma.business.count(),
  ]);

  return {
    businesses,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getBusinessById(id: string) {
  return prisma.business.findUnique({
    where: { id },
    include: {
      _count: {
        select: { users: true, customers: true, products: true, challans: true },
      },
      users: {
        select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
      },
    },
  });
}

export async function updateBusiness(id: string, data: Partial<Omit<CreateBusinessInput, "adminName" | "adminEmail" | "adminPassword">>) {
  return prisma.business.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.legalName !== undefined && { legalName: data.legalName }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.address !== undefined && { address: data.address }),
      ...(data.city !== undefined && { city: data.city }),
      ...(data.state !== undefined && { state: data.state }),
      ...(data.country !== undefined && { country: data.country }),
      ...(data.postalCode !== undefined && { postalCode: data.postalCode }),
      ...(data.gstin !== undefined && { gstin: data.gstin }),
    },
  });
}

export async function setBusinessStatus(id: string, status: "ACTIVE" | "SUSPENDED" | "INACTIVE") {
  return prisma.business.update({ where: { id }, data: { status } });
}
