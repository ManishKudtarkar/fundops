import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import {
  create,
  list,
  getById,
  update,
  setStatus,
} from "../controllers/business.controller";

const router = Router();

// All business routes require authentication and SUPER_ADMIN role
router.use(authenticate);
router.use(authorize("SUPER_ADMIN"));

// Create a new business with admin user
router.post("/", create);

// List all businesses with pagination
router.get("/", list);

// Get business details by ID
router.get("/:id", getById);

// Update business details
router.put("/:id", update);

// Set business status (ACTIVE, SUSPENDED, INACTIVE)
router.post("/:id/status", setStatus);

export default router;
