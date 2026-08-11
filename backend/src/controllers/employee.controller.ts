import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import { requireBusiness } from "../middleware/role.middleware";
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  resetEmployeePassword,
} from "../services/employee.service";

export async function list(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.businessId) {
      return res.status(403).json({ success: false, message: "Business context required" });
    }

    const employees = await getEmployees(req.user.businessId);

    return res.status(200).json({ success: true, data: employees });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to fetch employees" });
  }
}

export async function getById(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.businessId) {
      return res.status(403).json({ success: false, message: "Business context required" });
    }

    const employee = await getEmployeeById(req.params.id!, req.user.businessId);

    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    return res.status(200).json({ success: true, data: employee });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to fetch employee" });
  }
}

export async function create(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.businessId) {
      return res.status(403).json({ success: false, message: "Business context required" });
    }

    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password, and role are required",
      });
    }

    try {
      const employee = await createEmployee(req.user.businessId, {
        name,
        email,
        password,
        role,
      });

      return res.status(201).json({
        success: true,
        message: "Employee created successfully",
        data: employee,
      });
    } catch (error: any) {
      if (error.message.includes("Invalid role")) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      throw error;
    }
  } catch (error: any) {
    console.error(error);
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Email already in use",
      });
    }
    return res.status(500).json({ success: false, message: "Failed to create employee" });
  }
}

export async function update(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.businessId) {
      return res.status(403).json({ success: false, message: "Business context required" });
    }

    const { name, role, isActive } = req.body;

    if (!name && role === undefined && isActive === undefined) {
      return res.status(400).json({
        success: false,
        message: "At least one field (name, role, or isActive) is required",
      });
    }

    try {
      const employee = await updateEmployee(req.params.id!, req.user.businessId, {
        name,
        role,
        isActive,
      });

      if (!employee) {
        return res.status(404).json({ success: false, message: "Employee not found" });
      }

      return res.status(200).json({
        success: true,
        message: "Employee updated successfully",
        data: employee,
      });
    } catch (error: any) {
      if (error.message.includes("Invalid role")) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      throw error;
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to update employee" });
  }
}

export async function resetPassword(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.businessId) {
      return res.status(403).json({ success: false, message: "Business context required" });
    }

    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password is required",
      });
    }

    const employee = await resetEmployeePassword(req.params.id!, req.user.businessId, newPassword);

    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
      data: employee,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to reset password" });
  }
}
