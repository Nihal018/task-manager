import { Router } from "express";
import {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from "../controllers/taskController.js";
import { authenticate } from "../middleware/auth.js";
import { cacheTasks } from "../middleware/cache.js";

const router = Router();

router.use(authenticate);

router.post("/", createTask);
router.get("/", cacheTasks, getAllTasks); // ← cache only on GET list
router.get("/:id", getTaskById);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

export { router as taskRouter };
