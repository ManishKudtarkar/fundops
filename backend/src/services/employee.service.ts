import prisma from "../lib/prisma";
import bcrypt from "bcryptjs";

export async function getEmployees(businessId: string) {
  return prisma.user.findMany({
    where: { businessId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getEmployeeById(id: string, businessId: string) {
  return prisma.user.findFirst({
    where: { id, businessId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function createEmployee(
  businessId: string,
  data: { name: string; email: string; password: string; role: string }
) {
  const hashedPassword = await bcrypt.hash(data.password, 12);

  const allowedRoles = ["BUSINESS_ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"];
  if (!allowedRoles.includes(data.role)) {
    throw new Error(`Invalid role: ${data.role}`);
  }

  return prisma.user.create({
    data: {
      businessId,
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role as any,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });
}

export async function updateEmployee(
  id: string,
  businessId: string,
  data: { name?: string; role?: string; isActive?: boolean }
) {
  const existing = await prisma.user.findFirst({ where: { id, businessId } });
  if (!existing) return null;

  if (data.role) {
    const allowedRoles = ["BUSINESS_ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"];
    if (!allowedRoles.includes(data.role)) {
      throw new Error(`Invalid role: ${data.role}`);
    }
  }

  return prisma.user.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.role !== undefined && { role: data.role as any }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      updatedAt: true,
    },
  });
}

export async function resetEmployeePassword(
  id: string,
  businessId: string,
  newPassword: string
) {
  const existing = await prisma.user.findFirst({ where: { id, businessId } });
  if (!existing) return null;

  const hashed = await bcrypt.hash(newPassword, 12);
  return prisma.user.update({
    where: { id },
    data: { password: hashed },
    select: { id: true, name: true, email: true },
  });
}
