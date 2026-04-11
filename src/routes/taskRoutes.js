import { Router } from "express";

import { authenticate } from "../middleware/auth.js";

import {
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  createTask,
} from "../controllers/taskController.js";

const router = Router();

router.use(authenticate);

router.post("/", createTask);
router.get("/", getAllTasks);
router.get("/:id", getTaskById);
router.delete("/:id", deleteTask);
router.put("/:id", updateTask);

export { router as taskRouter };
