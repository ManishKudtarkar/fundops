import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import {
  createBusiness,
  getBusinesses,
  getBusinessById,
  updateBusiness,
  setBusinessStatus,
} from "../services/business.service";

export async function create(req: AuthenticatedRequest, res: Response) {
  try {
    const { name, legalName, email, phone, address, city, state, country, postalCode, gstin, adminName, adminEmail, adminPassword } = req.body;

    if (!name || !adminName || !adminEmail || !adminPassword) {
      return res.status(400).json({
        success: false,
        message: "Business name, admin name, admin email, and password are required",
      });
    }

    const result = await createBusiness({ name, legalName, email, phone, address, city, state, country, postalCode, gstin, adminName, adminEmail, adminPassword });

    return res.status(201).json({ success: true, message: "Business created successfully", data: result });
  } catch (error: any) {
    console.error(error);
    if (error?.code === "P2002" || error?.message?.includes("already exists")) {
      return res.status(409).json({ success: false, message: "Admin email already in use" });
    }
    return res.status(500).json({ success: false, message: "Failed to create business" });
  }
}

export async function list(req: AuthenticatedRequest, res: Response) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const result = await getBusinesses(page, limit);

    return res.status(200).json({ 
      success: true, 
      data: {
        items: result.businesses,
        pagination: result.pagination
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to fetch businesses" });
  }
}

export async function getById(req: AuthenticatedRequest, res: Response) {
  try {
    const business = await getBusinessById(req.params.id!);

    if (!business) {
      return res.status(404).json({ success: false, message: "Business not found" });
    }

    return res.status(200).json({ success: true, data: business });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to fetch business" });
  }
}

export async function update(req: AuthenticatedRequest, res: Response) {
  try {
    const business = await updateBusiness(req.params.id!, req.body);

    return res.status(200).json({ success: true, message: "Business updated successfully", data: business });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to update business" });
  }
}

export async function setStatus(req: AuthenticatedRequest, res: Response) {
  try {
    const { status } = req.body;
    const validStatuses = ["ACTIVE", "SUSPENDED", "INACTIVE"];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const business = await setBusinessStatus(req.params.id!, status);

    return res.status(200).json({ success: true, message: "Business status updated successfully", data: business });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to update business status" });
  }
}
