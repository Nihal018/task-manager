import pool from "../config/db.js";

const taskModel = {
  create: async (userId, title, description, status, priority, dueDate) => {
    const result = await pool.query(
      `INSERT INTO tasks (user_id, title, description, status, priority, due_date)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
      [userId, title, description, status, priority, dueDate],
    );
    return result.rows[0];
  },

  findAllByUser: async (userId) => {
    const result = await pool.query(
      `SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId],
    );

    return result.rows;
  },
  findByIdAndUser: async (taskId, userId) => {
    const result = await pool.query(
      `SELECT * FROM tasks WHERE id = $1 AND user_id = $2`,
      [taskId, userId],
    );
    return result.rows[0];
  },
  update: async (taskId, userId, fields) => {
    const { title, description, status, priority, due_date } = fields;

    const result = await pool.query(
      `UPDATE tasks
             SET title = COALESCE($1, title),
                 description = COALESCE($2, description),
                 status = COALESCE($3, status),
                 priority = COALESCE($4, priority),
                 due_date = COALESCE($5, due_date),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $6 AND user_id = $7
             RETURNING *`,
      [title, description, status, priority, due_date, taskId, userId],
    );
    return result.rows[0];
  },
  delete: async (taskId, userId) => {
    const result = await pool.query(
      `DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id`,
      [taskId, userId],
    );

    return result.rows[0];
  },
};

export { taskModel };
