import { Request, Response } from "express";
import { loginUser } from "../services/auth.service";
import { createBusiness } from "../services/business.service";

export async function register(req: Request, res: Response) {
  try {
    const { businessName, adminName, adminEmail, adminPassword } = req.body;

    if (!businessName || !adminName || !adminEmail || !adminPassword) {
      return res.status(400).json({
        success: false,
        message: "Business name, your name, email, and password are required",
      });
    }

    const result = await createBusiness({
      name: businessName,
      adminName,
      adminEmail,
      adminPassword,
    });

    return res.status(201).json({
      success: true,
      message: "Business registered successfully",
      data: result,
    });
  } catch (error: any) {
    if (error?.code === "P2002" || error?.message?.includes("already exists")) {
      return res.status(409).json({ success: false, message: "Email already in use" });
    }
    return res.status(500).json({ success: false, message: "Registration failed" });
  }
}

export async function login(
  req: Request,
  res: Response
) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const result = await loginUser(email, password);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Authentication failed",
    });
  }
}