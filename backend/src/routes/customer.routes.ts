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
  followUp,
  remove,
} from "../controllers/customer.controller";

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

router.put(
  "/:id",
  authorize("BUSINESS_ADMIN", "SALES"),
  update
);

router.post(
  "/:id/follow-up",
  authorize("BUSINESS_ADMIN", "SALES"),
  followUp
);

router.delete(
  "/:id",
  authorize("BUSINESS_ADMIN", "SALES"),
  remove
);

export default router;