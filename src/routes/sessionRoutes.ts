import { Router } from "express";
import {
  createSession,
  getAllSessions,
  getSessionById,
  updateSession,
} from "../controllers/sessionController";
import {
  authMiddleware,
  requireOrganizer,
} from "../middlewares/authMiddleware";
import { validateCreateSession } from "../validations/sessionValidations";

const router = Router();

router.post(
  "/",
  authMiddleware,
  requireOrganizer,
  validateCreateSession,
  createSession
);
router.get("/", getAllSessions);
router.get("/:sessionId", getSessionById);
router.patch("/:sessionId", authMiddleware, requireOrganizer, updateSession);
export default router;
