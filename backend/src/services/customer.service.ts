import prisma from "../lib/prisma";

interface CustomerFilters {
  businessId: string;
  search?: string;
  status?: "LEAD" | "ACTIVE" | "INACTIVE";
  customerType?: "RETAIL" | "WHOLESALE" | "DISTRIBUTOR";
  page?: number;
  limit?: number;
}

export async function createCustomer(data: any, userId: string, businessId: string) {
  return prisma.customer.create({
    data: {
      businessId,
      name: data.name,
      mobile: data.mobile,
      email: data.email || null,
      businessName: data.businessName,
      gstNumber: data.gstNumber || null,
      customerType: data.customerType,
      address: data.address,
      status: data.status,
      followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
      notes: data.notes || null,
      createdById: userId,
    },
  });
}

export async function getCustomers(filters: CustomerFilters) {
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const skip = (page - 1) * limit;

  const where: any = { businessId: filters.businessId };

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { mobile: { contains: filters.search } },
      { businessName: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  if (filters.status) where.status = filters.status;
  if (filters.customerType) where.customerType = filters.customerType;

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" } }),
    prisma.customer.count({ where }),
  ]);

  return {
    customers,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getCustomerById(id: string, businessId: string) {
  return prisma.customer.findFirst({
    where: { id, businessId },
    include: { challans: true },
  });
}

export async function updateCustomer(id: string, businessId: string, data: any) {
  const existing = await prisma.customer.findFirst({ where: { id, businessId } });
  if (!existing) return null;

  return prisma.customer.update({
    where: { id },
    data: {
      ...data,
      followUpDate:
        data.followUpDate !== undefined
          ? data.followUpDate ? new Date(data.followUpDate) : null
          : undefined,
    },
  });
}

export async function deleteCustomer(id: string, businessId: string) {
  const existing = await prisma.customer.findFirst({ where: { id, businessId } });
  if (!existing) return null;
  return prisma.customer.delete({ where: { id } });
}

export async function addFollowUp(id: string, businessId: string, notes: string, followUpDate?: string) {
  const existing = await prisma.customer.findFirst({ where: { id, businessId } });
  if (!existing) return null;

  const data: any = { notes };
  if (followUpDate !== undefined) {
    data.followUpDate = followUpDate ? new Date(followUpDate) : null;
  }

  return prisma.customer.update({ where: { id }, data });
}
