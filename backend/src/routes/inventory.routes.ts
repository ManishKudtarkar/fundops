import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { listMovements } from "../controllers/inventory.controller";

const router = Router();

router.use(authenticate);

router.get(
  "/movements",
  authorize("BUSINESS_ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"),
  listMovements
);

export default router;
