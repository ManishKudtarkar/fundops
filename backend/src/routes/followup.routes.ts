import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { authorize, requireBusiness } from "../middleware/role.middleware";
import {
  create,
  list,
  getById,
  update,
  remove,
  getDashboard,
} from "../controllers/followup.controller";

const router = Router();

// All follow-up routes require authentication and business context
router.use(authenticate);
router.use(requireBusiness());
router.use(authorize("BUSINESS_ADMIN", "SALES"));

// List all follow-ups (with filters)
router.get("/", list);

// Get follow-up dashboard summary
router.get("/dashboard/summary", getDashboard);

// Get follow-up by ID
router.get("/:id", getById);

// Create follow-up
router.post("/", create);

// Update follow-up
router.put("/:id", update);

// Delete follow-up
router.delete("/:id", remove);

export default router;
