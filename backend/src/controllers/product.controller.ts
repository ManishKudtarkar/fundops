import { Response } from "express";

import {
  AuthenticatedRequest,
} from "../middleware/auth.middleware";

import {
  createProductSchema,
  updateProductSchema,
  stockMovementSchema,
} from "../validators/product.validator";

import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  createStockMovement,
} from "../services/product.service";

export async function create(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const validation =
      createProductSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.flatten(),
      });
    }

    const product = await createProduct(
      validation.data
    );

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error: any) {
    console.error(error);

    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "SKU already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create product",
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

    const lowStock =
      req.query.lowStock === "true";

    const result = await getProducts({
      search: req.query.search as string,
      category: req.query.category as string,
      lowStock,
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
      message: "Failed to fetch products",
    });
  }
}

export async function getById(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const product = await getProductById(
      req.params.id
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
}

export async function update(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const validation =
      updateProductSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.flatten(),
      });
    }

    const existing =
      await getProductById(req.params.id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const product = await updateProduct(
      req.params.id,
      validation.data
    );

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error: any) {
    console.error(error);

    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "SKU already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update product",
    });
  }
}

export async function stockMovement(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const validation =
      stockMovementSchema.safeParse(req.body);

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

    try {
      const result =
        await createStockMovement(
          req.params.id,
          validation.data.quantity,
          validation.data.movementType,
          validation.data.reason,
          req.user.userId
        );

      return res.status(200).json({
        success: true,
        message: "Stock movement recorded successfully",
        data: result,
      });
    } catch (error: any) {
      if (
        error.message === "Product not found"
      ) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (
        error.message.startsWith(
          "Insufficient stock"
        )
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      throw error;
    }
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to record stock movement",
    });
  }
}