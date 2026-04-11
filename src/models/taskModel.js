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

  findAllByUser: async (userId, options) => {
    const { page, limit, status, priority, sort, order } = options;
    const offset = (page - 1) * limit;

    // Build WHERE clause dynamically
    const conditions = ["user_id = $1"];
    const values = [userId];
    let paramIndex = 2;

    if (status) {
      conditions.push(`status = $${paramIndex}`);
      values.push(status);
      paramIndex++;
    }

    if (priority) {
      conditions.push(`priority = $${paramIndex}`);
      values.push(priority);
      paramIndex++;
    }

    const whereClause = conditions.join(" AND ");

    // Get total count (for pagination metadata)
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM tasks WHERE ${whereClause}`,
      values,
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    const dataResult = await pool.query(
      `SELECT * FROM tasks
         WHERE ${whereClause}
         ORDER BY ${sort} ${order}
         LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...values, limit, offset],
    );

    return {
      tasks: dataResult.rows,
      total,
    };
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
