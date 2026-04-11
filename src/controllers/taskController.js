import taskModel from "../models/taskModel.js";

export const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, due_date } = req.body;
    const userId = req.user.id;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const task = await taskModel.createTask(
      userId,
      title,
      description || "",
      status || "pending",
      priority || "medium",
      due_date || null,
    );

    res.status(201).json({ message: "Task created successfully", task });
  } catch (err) {
    console.error("Create Task error: ", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getAllTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const tasks = await taskModel.findAllByUser(userId);

    res.json({
      count: tasks.length,
      tasks,
    });
  } catch (err) {
    console.error("Get tasks error: ", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const userId = req.user.id;
    const taskId = parseInt(req.params.id);

    if (isNaN(taskId)) {
      return res.status(400).json({ error: "Invalid task ID" });
    }

    const task = await taskModel.findByIdAndUser(taskId, userId);

    if (!task) {
      return res.status(404).json({ error: "task not found" });
    }

    res.json({ task });
  } catch (err) {
    console.error("Get task error: ", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const taskId = parseInt(req.params.id);

    const { title, description, status, priority, due_date } = req.body;

    if (status && !["pending", "in-progress", "completed"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    if (priority && !["low", "medium", "high"].includes(priority)) {
      return res.status(400).json({ error: "Invalid priority value" });
    }

    const updatedTask = await taskModel.update(taskId, userId, {
      title,
      description,
      status,
      priority,
      due_date,
    });

    if (!updatedTask) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (err) {
    console.error("Get task error: ", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const taskId = parseInt(req.params.id);

    if (isNaN(taskId)) {
      return res.status(400).json({ error: "Invalid task ID" });
    }

    const deleted = await taskModel.delete(taskId, userId);

    if (!deleted) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({
      message: "Task deleted successfully",
      id: deleted.id,
    });
  } catch (err) {
    console.error("Delete task error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
