import { Router } from "express";
import { joinSession, submitVotes } from "../controllers/voteController";

const router = Router();

router.get("/join/:joinCode", joinSession);
router.post("/", submitVotes);

export default router;