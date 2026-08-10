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
  authorize("ADMIN", "WAREHOUSE"),
  create
);

router.get(
  "/",
  authorize(
    "ADMIN",
    "SALES",
    "WAREHOUSE",
    "ACCOUNTS"
  ),
  list
);

router.get(
  "/:id",
  authorize(
    "ADMIN",
    "SALES",
    "WAREHOUSE",
    "ACCOUNTS"
  ),
  getById
);

router.put(
  "/:id",
  authorize("ADMIN", "WAREHOUSE"),
  update
);

router.post(
  "/:id/stock",
  authorize("ADMIN", "WAREHOUSE"),
  stockMovement
);

export default router;