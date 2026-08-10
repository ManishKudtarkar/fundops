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
} from "../controllers/customer.controller";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorize("ADMIN", "SALES"),
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
  authorize("ADMIN", "SALES"),
  update
);

router.post(
  "/:id/follow-up",
  authorize("ADMIN", "SALES"),
  followUp
);

export default router;