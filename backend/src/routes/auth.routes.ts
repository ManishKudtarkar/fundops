import { Router } from "express";
import { login } from "../controllers/auth.controller";
import {
  authenticate,
  AuthenticatedRequest,
} from "../middleware/auth.middleware";

const router = Router();

router.post("/login", login);

router.get(
  "/me",
  authenticate,
  (req: AuthenticatedRequest, res) => {
    return res.status(200).json({
      success: true,
      message: "Authenticated user",
      data: {
        user: req.user,
      },
    });
  }
);

export default router;