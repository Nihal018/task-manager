import "dotenv/config";
import express from "express";
import { routes } from "./routes/index.js";
import pool from "./config/db.js";
import { authRouter } from "./routes/authRoutes.js";
import { protectedRouter } from "./routes/protectedRoutes.js";
import { taskRouter } from "./routes/taskRoutes.js";
import { apiLimiter, authLimiter } from "./middleware/rateLimiter.js";

const app = express();

app.use(express.json());
app.use("/api", apiLimiter); // applies to ALL /api routes
app.use("/api/auth/login", authLimiter); // stricter on login
app.use("/api/auth/register", authLimiter);

app.use("/api", protectedRouter);
app.use("/api/auth", authRouter);

app.use("/api/tasks", taskRouter);

app.get("/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      message: "Database connected",
      time: result.rows[0].now,
    });
  } catch (err) {
    res.status(500).json({ error: "Database connection failed" });
  }
});

export { app };
