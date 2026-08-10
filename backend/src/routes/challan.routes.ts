import { Router } from "express";

import {
  create,
  list,
  getById,
  confirm,
  cancel,
} from "../controllers/challan.controller";

import {
  authenticate,
} from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.post("/", create);

router.get("/", list);

router.get("/:id", getById);

router.post(
  "/:id/confirm",
  confirm
);

router.post(
  "/:id/cancel",
  cancel
);

export default router;