import express, { Router } from "express";
import { fetchHome } from "../controllers/homeController";

const router: Router = express.Router();
router.get("/home", fetchHome);

export default router;
