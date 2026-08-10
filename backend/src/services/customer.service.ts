import prisma from "../lib/prisma";

interface CustomerFilters {
  search?: string;
  status?: "LEAD" | "ACTIVE" | "INACTIVE";
  customerType?: "RETAIL" | "WHOLESALE" | "DISTRIBUTOR";
  page?: number;
  limit?: number;
}

export async function createCustomer(
  data: any,
  userId: string
) {
  return prisma.customer.create({
    data: {
      name: data.name,
      mobile: data.mobile,
      email: data.email || null,
      businessName: data.businessName,
      gstNumber: data.gstNumber || null,
      customerType: data.customerType,
      address: data.address,
      status: data.status,
      followUpDate: data.followUpDate
        ? new Date(data.followUpDate)
        : null,
      notes: data.notes || null,
      createdById: userId,
    },
  });
}

export async function getCustomers(
  filters: CustomerFilters
) {
  const page = filters.page || 1;
  const limit = filters.limit || 10;

  const skip = (page - 1) * limit;

  const where: any = {};

  if (filters.search) {
    where.OR = [
      {
        name: {
          contains: filters.search,
          mode: "insensitive",
        },
      },
      {
        mobile: {
          contains: filters.search,
        },
      },
      {
        businessName: {
          contains: filters.search,
          mode: "insensitive",
        },
      },
    ];
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.customerType) {
    where.customerType = filters.customerType;
  }

  const [customers, total] =
    await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.customer.count({
        where,
      }),
    ]);

  return {
    customers,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getCustomerById(
  id: string
) {
  return prisma.customer.findUnique({
    where: { id },
    include: {
      challans: true,
    },
  });
}

export async function updateCustomer(
  id: string,
  data: any
) {
  return prisma.customer.update({
    where: { id },
    data: {
      ...data,
      followUpDate:
        data.followUpDate !== undefined
          ? data.followUpDate
            ? new Date(data.followUpDate)
            : null
          : undefined,
    },
  });
}

export async function addFollowUp(
  id: string,
  notes: string,
  followUpDate?: string
) {
  return prisma.customer.update({
    where: { id },
    data: {
      notes,
      followUpDate: followUpDate
        ? new Date(followUpDate)
        : undefined,
    },
  });
}