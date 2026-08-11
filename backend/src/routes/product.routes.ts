import { Router } from "express";

import {
  authenticate,
} from "../middleware/auth.middleware";

import {
  authorize,
} from "../middleware/role.middleware";

import {
  create,
  list,
  getById,
  update,
  stockMovement,
} from "../controllers/product.controller";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorize("BUSINESS_ADMIN", "WAREHOUSE"),
  create
);

router.get(
  "/",
  authorize(
    "BUSINESS_ADMIN",
    "SALES",
    "WAREHOUSE",
    "ACCOUNTS"
  ),
  list
);

router.get(
  "/:id",
  authorize(
    "BUSINESS_ADMIN",
    "SALES",
    "WAREHOUSE",
    "ACCOUNTS"
  ),
  getById
);

router.put(
  "/:id",
  authorize("BUSINESS_ADMIN", "WAREHOUSE"),
  update
);

router.post(
  "/:id/stock",
  authorize("BUSINESS_ADMIN", "WAREHOUSE"),
  stockMovement
);

export default router;