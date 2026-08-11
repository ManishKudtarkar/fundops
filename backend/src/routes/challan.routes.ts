import { Router } from "express";

import {
  create,
  list,
  getById,
  confirm,
  cancel,
  remove,
} from "../controllers/challan.controller";

import {
  authenticate,
} from "../middleware/auth.middleware";

import {
  authorize,
} from "../middleware/role.middleware";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorize("BUSINESS_ADMIN", "SALES"),
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

router.post(
  "/:id/confirm",
  authorize("BUSINESS_ADMIN", "WAREHOUSE"),
  confirm
);

router.post(
  "/:id/cancel",
  authorize("BUSINESS_ADMIN", "SALES"),
  cancel
);

router.delete(
  "/:id",
  authorize("BUSINESS_ADMIN", "SALES"),
  remove
);

export default router;