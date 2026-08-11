import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import {
  createFollowUp,
  getFollowUps,
  getFollowUpById,
  updateFollowUp,
  getDashboardFollowUps,
  deleteFollowUp,
} from "../services/followup.service";

export async function create(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.businessId) {
      return res.status(403).json({ success: false, message: "Business context required" });
    }

    const { customerId, title, notes, followUpDate, assignedTo } = req.body;

    if (!customerId || !title || !followUpDate) {
      return res.status(400).json({
        success: false,
        message: "customerId, title, and followUpDate are required",
      });
    }

    const followUp = await createFollowUp(
      req.user.businessId,
      customerId,
      {
        title,
        notes,
        followUpDate,
        assignedTo,
      },
      req.user.userId
    );

    return res.status(201).json({
      success: true,
      message: "Follow-up created successfully",
      data: followUp,
    });
  } catch (error: any) {
    console.error(error);
    if (error.message === "Customer not found") {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }
    return res.status(500).json({ success: false, message: "Failed to create follow-up" });
  }
}

export async function list(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.businessId) {
      return res.status(403).json({ success: false, message: "Business context required" });
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const result = await getFollowUps({
      businessId: req.user.businessId,
      status: req.query.status as any,
      customerId: req.query.customerId ? String(req.query.customerId) : undefined,
      assignedTo: req.query.assignedTo ? String(req.query.assignedTo) : undefined,
      dateFrom: req.query.dateFrom ? String(req.query.dateFrom) : undefined,
      dateTo: req.query.dateTo ? String(req.query.dateTo) : undefined,
      page,
      limit,
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to fetch follow-ups" });
  }
}

export async function getById(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.businessId) {
      return res.status(403).json({ success: false, message: "Business context required" });
    }

    const followUp = await getFollowUpById(req.params.id!, req.user.businessId);

    if (!followUp) {
      return res.status(404).json({ success: false, message: "Follow-up not found" });
    }

    return res.status(200).json({ success: true, data: followUp });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to fetch follow-up" });
  }
}

export async function update(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.businessId) {
      return res.status(403).json({ success: false, message: "Business context required" });
    }

    const { title, notes, followUpDate, assignedTo, status } = req.body;

    if (!title && !notes && !followUpDate && !assignedTo && !status) {
      return res.status(400).json({
        success: false,
        message: "At least one field (title, notes, followUpDate, assignedTo, status) is required",
      });
    }

    const followUp = await updateFollowUp(req.params.id!, req.user.businessId, {
      title,
      notes,
      followUpDate,
      assignedTo,
      status,
    });

    if (!followUp) {
      return res.status(404).json({ success: false, message: "Follow-up not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Follow-up updated successfully",
      data: followUp,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to update follow-up" });
  }
}

export async function remove(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.businessId) {
      return res.status(403).json({ success: false, message: "Business context required" });
    }

    const deleted = await deleteFollowUp(req.params.id!, req.user.businessId);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Follow-up not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Follow-up deleted successfully",
      data: deleted,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to delete follow-up" });
  }
}

export async function getDashboard(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.businessId) {
      return res.status(403).json({ success: false, message: "Business context required" });
    }

    const data = await getDashboardFollowUps(req.user.businessId);

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to fetch follow-up dashboard" });
  }
}
