import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import { createCustomerSchema, updateCustomerSchema } from "../validators/customer.validator";
import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  addFollowUp,
  deleteCustomer,
} from "../services/customer.service";

export async function create(req: AuthenticatedRequest, res: Response) {
  try {
    const validation = createCustomerSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ success: false, message: "Validation failed", errors: validation.error.flatten() });
    }

    if (!req.user?.businessId) {
      return res.status(403).json({ success: false, message: "Business context required" });
    }

    // businessId comes from the authenticated user — NOT from the request body
    const customer = await createCustomer(validation.data, req.user.userId, req.user.businessId);

    return res.status(201).json({ success: true, message: "Customer created successfully", data: customer });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to create customer" });
  }
}

export async function list(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.businessId) {
      return res.status(403).json({ success: false, message: "Business context required" });
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await getCustomers({
      businessId: req.user.businessId,
      search: req.query.search as string,
      status: req.query.status as any,
      customerType: req.query.customerType as any,
      page,
      limit,
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to fetch customers" });
  }
}

export async function getById(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.businessId) {
      return res.status(403).json({ success: false, message: "Business context required" });
    }

    const customer = await getCustomerById(req.params.id!, req.user.businessId);

    if (!customer) {
      return res.status(404).json({ success: false, message: "Resource not found" });
    }

    return res.status(200).json({ success: true, data: customer });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to fetch customer" });
  }
}

export async function update(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.businessId) {
      return res.status(403).json({ success: false, message: "Business context required" });
    }

    const validation = updateCustomerSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ success: false, message: "Validation failed", errors: validation.error.flatten() });
    }

    const customer = await updateCustomer(req.params.id!, req.user.businessId, validation.data);

    if (!customer) {
      return res.status(404).json({ success: false, message: "Resource not found" });
    }

    return res.status(200).json({ success: true, message: "Customer updated successfully", data: customer });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to update customer" });
  }
}

export async function followUp(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.businessId) {
      return res.status(403).json({ success: false, message: "Business context required" });
    }

    const { notes, followUpDate } = req.body as { notes?: string; followUpDate?: string };

    if (!notes) {
      return res.status(400).json({ success: false, message: "Follow-up notes are required" });
    }

    const customer = await addFollowUp(req.params.id!, req.user.businessId, notes, followUpDate);

    if (!customer) {
      return res.status(404).json({ success: false, message: "Resource not found" });
    }

    return res.status(200).json({ success: true, message: "Follow-up added successfully", data: customer });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to add follow-up" });
  }
}

export async function remove(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.businessId) {
      return res.status(403).json({ success: false, message: "Business context required" });
    }

    const deleted = await deleteCustomer(req.params.id!, req.user.businessId);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Resource not found" });
    }

    return res.status(200).json({ success: true, message: "Customer deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to delete customer" });
  }
}
