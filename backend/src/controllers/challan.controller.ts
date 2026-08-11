import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import { createChallanSchema } from "../validators/challan.validator";
import {
  createChallanAndClearCache,
  getChallans,
  getChallanById,
  confirmChallan,
  cancelChallan,
  deleteChallan,
} from "../services/challan.service";

export async function create(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.businessId) {
      return res.status(403).json({ success: false, message: "Business context required" });
    }

    const validation = createChallanSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ success: false, message: "Validation failed", errors: validation.error.flatten() });
    }

    const challan = await createChallanAndClearCache(
      req.user.businessId,
      validation.data.customerId,
      validation.data.items,
      req.user.userId
    );

    return res.status(201).json({ success: true, message: "Sales challan created successfully", data: challan });
  } catch (error: any) {
    console.error(error);
    if (error.message === "Customer not found") {
      return res.status(404).json({ success: false, message: "Resource not found" });
    }
    if (error.message.includes("product") || error.message.includes("Product")) {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: "Failed to create sales challan" });
  }
}

export async function list(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.businessId) {
      return res.status(403).json({ success: false, message: "Business context required" });
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await getChallans(req.user.businessId, page, limit);

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to fetch challans" });
  }
}

export async function getById(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.businessId) {
      return res.status(403).json({ success: false, message: "Business context required" });
    }

    const challan = await getChallanById(req.params.id!, req.user.businessId);

    if (!challan) {
      return res.status(404).json({ success: false, message: "Resource not found" });
    }

    return res.status(200).json({ success: true, data: challan });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to fetch challan" });
  }
}

export async function confirm(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.businessId) {
      return res.status(403).json({ success: false, message: "Business context required" });
    }

    const challan = await confirmChallan(req.params.id!, req.user.businessId, req.user.userId);

    return res.status(200).json({ success: true, message: "Sales challan confirmed successfully", data: challan });
  } catch (error: any) {
    console.error(error);
    if (error.message === "Challan not found") {
      return res.status(404).json({ success: false, message: "Resource not found" });
    }
    if (error.message.includes("Only DRAFT") || error.message.includes("Insufficient stock") || error.message.includes("Product not found")) {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: "Failed to confirm sales challan" });
  }
}

export async function cancel(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.businessId) {
      return res.status(403).json({ success: false, message: "Business context required" });
    }

    const challan = await cancelChallan(req.params.id!, req.user.businessId);

    return res.status(200).json({ success: true, message: "Sales challan cancelled successfully", data: challan });
  } catch (error: any) {
    console.error(error);
    if (error.message === "Challan not found") {
      return res.status(404).json({ success: false, message: "Resource not found" });
    }
    if (error.message.includes("Only DRAFT")) {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: "Failed to cancel sales challan" });
  }
}

export async function remove(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.businessId) {
      return res.status(403).json({ success: false, message: "Business context required" });
    }

    const deleted = await deleteChallan(req.params.id!, req.user.businessId);

    return res.status(200).json({ success: true, message: "Sales challan deleted successfully", data: deleted });
  } catch (error: any) {
    console.error(error);
    if (error.message === "Challan not found") {
      return res.status(404).json({ success: false, message: "Resource not found" });
    }
    if (error.message.includes("Only DRAFT")) {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: "Failed to delete sales challan" });
  }
}
