import express from "express";
import { login, register } from "../controllers/userController";
import { validateLogin, validateRegister } from "../validations/userValidations";
const router = express.Router();

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);

export default router;
