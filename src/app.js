import "dotenv/config";
import express from "express";
import { routes } from "./routes/index.js";
import pool from "./config/db.js";
import { authRouter } from "./routes/authRoutes.js";
import { protectedRouter } from "./routes/protectedRoutes.js";

const app = express();

app.use(express.json());
app.use("/api", protectedRouter);
app.use("/api/auth", authRouter);

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
