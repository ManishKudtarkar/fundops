import { Response } from "express";

import {
  AuthenticatedRequest,
} from "../middleware/auth.middleware";

import {
  createCustomerSchema,
  updateCustomerSchema,
} from "../validators/customer.validator";

import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  addFollowUp,
} from "../services/customer.service";

export async function create(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const validation =
      createCustomerSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.flatten(),
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const customer = await createCustomer(
      validation.data,
      req.user.userId
    );

    return res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: customer,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to create customer",
    });
  }
}

export async function list(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await getCustomers({
      search: req.query.search as string,
      status: req.query.status as any,
      customerType:
        req.query.customerType as any,
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
    });
  }
}

export async function getById(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const customer = await getCustomerById(
      req.params.id
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch customer",
    });
  }
}

export async function update(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const validation =
      updateCustomerSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.flatten(),
      });
    }

    const existing =
      await getCustomerById(req.params.id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const customer = await updateCustomer(
      req.params.id,
      validation.data
    );

    return res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      data: customer,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to update customer",
    });
  }
}

export async function followUp(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { notes, followUpDate } = req.body;

    if (!notes) {
      return res.status(400).json({
        success: false,
        message: "Follow-up notes are required",
      });
    }

    const existing =
      await getCustomerById(req.params.id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const customer = await addFollowUp(
      req.params.id,
      notes,
      followUpDate
    );

    return res.status(200).json({
      success: true,
      message: "Follow-up added successfully",
      data: customer,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to add follow-up",
    });
  }
}