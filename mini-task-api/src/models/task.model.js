const { getPool } = require('../config/db');

async function createTask({ title, description, priority = 'medium', ownerId = null, assignedTo = null, isPublic = true }) {
    const pool = getPool();
    const [result] = await pool.query(
        `INSERT INTO tasks (title, description, priority, ownerId, assignedTo, isPublic)
     VALUES (?, ?, ?, ?, ?, ?)`,
        [title, description, priority, ownerId, assignedTo, isPublic ? 1 : 0]
    );
    const id = result.insertId;
    return getTaskById(id);
}

async function getTaskById(id) {
    const pool = getPool();
    const [rows] = await pool.query(`SELECT * FROM tasks WHERE id = ?`, [id]);
    return rows[0] || null;
}

async function updateTask(id, fields = {}) {
    const pool = getPool();
    const sets = [];
    const vals = [];
    for (const k of Object.keys(fields)) {
        sets.push(`${k}=?`);
        vals.push(fields[k]);
    }
    if (!sets.length) return getTaskById(id);
    vals.push(id);
    await pool.query(`UPDATE tasks SET ${sets.join(', ')}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`, vals);
    return getTaskById(id);
}

async function deleteTask(id) {
    const pool = getPool();
    await pool.query(`DELETE FROM tasks WHERE id = ?`, [id]);
    return true;
}

async function listTasks(filters = {}, page = 1, limit = 20, sort = 'createdAt:desc') {
    const pool = getPool();
    const where = [];
    const vals = [];

    if (filters.status) { where.push('status = ?'); vals.push(filters.status); }
    if (filters.priority) { where.push('priority = ?'); vals.push(filters.priority); }
    if (filters.assignedTo) { where.push('assignedTo = ?'); vals.push(filters.assignedTo); }
    if (filters.isPublic !== undefined) { where.push('isPublic = ?'); vals.push(filters.isPublic ? 1 : 0); }

    const [sortField, sortDir] = (sort || 'createdAt:desc').split(':');
    const offset = (page - 1) * limit;

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const q = `SELECT * FROM tasks ${whereSql} ORDER BY ${sortField} ${sortDir.toUpperCase()} LIMIT ? OFFSET ?`;
    vals.push(Number(limit), Number(offset));
    const [rows] = await pool.query(q, vals);
    return rows;
}

module.exports = { createTask, getTaskById, updateTask, deleteTask, listTasks };
