import { Router } from "express";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.get("/profile", authenticate, (req, res) => {
  res.json({ message: "You are authenticated", user: req.user });
});

export { router as protectedRouter };
