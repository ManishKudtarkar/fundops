import prisma from "../lib/prisma";

export interface FollowUpFilters {
  businessId: string;
  status?: "PENDING" | "COMPLETED" | "CANCELLED";
  customerId?: string;
  assignedTo?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export async function createFollowUp(
  businessId: string,
  customerId: string,
  data: {
    title: string;
    notes?: string;
    followUpDate: string;
    assignedTo?: string;
  },
  createdBy: string
) {
  // Verify customer belongs to business
  const customer = await prisma.customer.findFirst({
    where: { id: customerId, businessId },
  });

  if (!customer) {
    throw new Error("Customer not found");
  }

  return prisma.followUp.create({
    data: {
      businessId,
      customerId,
      title: data.title,
      notes: data.notes || null,
      followUpDate: new Date(data.followUpDate),
      assignedTo: data.assignedTo || null,
      createdBy,
      status: "PENDING",
    },
    include: {
      customer: { select: { id: true, name: true, email: true, mobile: true } },
      assignedToUser: { select: { id: true, name: true, email: true } },
      createdByUser: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function getFollowUps(filters: FollowUpFilters) {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = { businessId: filters.businessId };

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.customerId) {
    where.customerId = filters.customerId;
  }

  if (filters.assignedTo) {
    where.assignedTo = filters.assignedTo;
  }

  if (filters.dateFrom || filters.dateTo) {
    where.followUpDate = {};
    if (filters.dateFrom) {
      where.followUpDate.gte = new Date(filters.dateFrom);
    }
    if (filters.dateTo) {
      const end = new Date(filters.dateTo);
      end.setHours(23, 59, 59, 999);
      where.followUpDate.lte = end;
    }
  }

  const [followUps, total] = await Promise.all([
    prisma.followUp.findMany({
      where,
      skip,
      take: limit,
      orderBy: { followUpDate: "asc" },
      include: {
        customer: { select: { id: true, name: true, email: true, mobile: true } },
        assignedToUser: { select: { id: true, name: true, email: true } },
        createdByUser: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.followUp.count({ where }),
  ]);

  return {
    followUps,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getFollowUpById(id: string, businessId: string) {
  return prisma.followUp.findFirst({
    where: { id, businessId },
    include: {
      customer: { select: { id: true, name: true, email: true, mobile: true } },
      assignedToUser: { select: { id: true, name: true, email: true } },
      createdByUser: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function updateFollowUp(
  id: string,
  businessId: string,
  data: {
    title?: string;
    notes?: string;
    followUpDate?: string;
    assignedTo?: string;
    status?: "PENDING" | "COMPLETED" | "CANCELLED";
  }
) {
  const existing = await prisma.followUp.findFirst({
    where: { id, businessId },
  });

  if (!existing) {
    return null;
  }

  return prisma.followUp.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.followUpDate !== undefined && { followUpDate: new Date(data.followUpDate) }),
      ...(data.assignedTo !== undefined && { assignedTo: data.assignedTo }),
      ...(data.status !== undefined && { status: data.status }),
    },
    include: {
      customer: { select: { id: true, name: true, email: true, mobile: true } },
      assignedToUser: { select: { id: true, name: true, email: true } },
      createdByUser: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function getDashboardFollowUps(businessId: string) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [todayFollowUps, overdueFollowUps, upcomingFollowUps] = await Promise.all([
    // Today's follow-ups
    prisma.followUp.findMany({
      where: {
        businessId,
        status: "PENDING",
        followUpDate: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        customer: { select: { id: true, name: true } },
        assignedToUser: { select: { id: true, name: true } },
      },
    }),

    // Overdue follow-ups
    prisma.followUp.findMany({
      where: {
        businessId,
        status: "PENDING",
        followUpDate: {
          lt: today,
        },
      },
      include: {
        customer: { select: { id: true, name: true } },
        assignedToUser: { select: { id: true, name: true } },
      },
      orderBy: { followUpDate: "asc" },
      take: 10,
    }),

    // Upcoming follow-ups (next 7 days)
    prisma.followUp.findMany({
      where: {
        businessId,
        status: "PENDING",
        followUpDate: {
          gte: tomorrow,
          lt: new Date(tomorrow.getTime() + 7 * 24 * 60 * 60 * 1000),
        },
      },
      include: {
        customer: { select: { id: true, name: true } },
        assignedToUser: { select: { id: true, name: true } },
      },
      orderBy: { followUpDate: "asc" },
      take: 10,
    }),
  ]);

  return {
    today: todayFollowUps,
    overdue: overdueFollowUps,
    upcoming: upcomingFollowUps,
  };
}

export async function deleteFollowUp(id: string, businessId: string) {
  const existing = await prisma.followUp.findFirst({
    where: { id, businessId },
  });

  if (!existing) {
    return null;
  }

  return prisma.followUp.delete({ where: { id } });
}
