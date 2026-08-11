import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import { getStockMovements } from "../services/product.service";

export async function listMovements(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.businessId) {
      return res.status(403).json({ success: false, message: "Business context required" });
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;

    const result = await getStockMovements({
      businessId: req.user.businessId,
      search: req.query.search ? String(req.query.search) : undefined,
      productId: req.query.productId ? String(req.query.productId) : undefined,
      movementType: req.query.movementType
        ? (String(req.query.movementType) as "IN" | "OUT" | "ADJUSTMENT")
        : undefined,
      dateFrom: req.query.dateFrom ? String(req.query.dateFrom) : undefined,
      dateTo: req.query.dateTo ? String(req.query.dateTo) : undefined,
      referenceId: req.query.referenceId ? String(req.query.referenceId) : undefined,
      createdById: req.query.createdById ? String(req.query.createdById) : undefined,
      page,
      limit,
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to fetch inventory movements" });
  }
}
