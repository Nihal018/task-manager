import { Router } from "express";
import { refresh, login, register } from "../controllers/authcontrollers.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);

export { router as authRouter };
