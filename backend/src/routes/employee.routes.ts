import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { authorize, requireBusiness } from "../middleware/role.middleware";
import {
  list,
  getById,
  create,
  update,
  resetPassword,
} from "../controllers/employee.controller";

const router = Router();

// All employee routes require authentication and business context
router.use(authenticate);
router.use(requireBusiness());
router.use(authorize("BUSINESS_ADMIN"));

// List all employees in the business
router.get("/", list);

// Get employee details by ID
router.get("/:id", getById);

// Create a new employee
router.post("/", create);

// Update employee details or role
router.put("/:id", update);

// Reset employee password
router.post("/:id/reset-password", resetPassword);

export default router;
