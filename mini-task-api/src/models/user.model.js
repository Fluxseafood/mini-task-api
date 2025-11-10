const { getPool } = require('../config/db');

async function createUser({ email, password, name, role = 'user', isPremium = false, subscriptionExpiry = null }) {
    const pool = getPool();
    const [result] = await pool.query(
        `INSERT INTO users (email, password, name, role, isPremium, subscriptionExpiry)
     VALUES (?, ?, ?, ?, ?, ?)`,
        [email, password, name, role, isPremium ? 1 : 0, subscriptionExpiry]
    );
    const id = result.insertId;
    return getUserById(id);
}

async function getUserByEmail(email) {
    const pool = getPool();
    const [rows] = await pool.query(`SELECT * FROM users WHERE email = ?`, [email]);
    return rows[0] || null;
}

async function getUserById(id) {
    const pool = getPool();
    const [rows] = await pool.query(`SELECT * FROM users WHERE id = ?`, [id]);
    return rows[0] || null;
}

async function updateUser(id, fields = {}) {
    const pool = getPool();
    const sets = [];
    const vals = [];
    for (const k of Object.keys(fields)) {
        sets.push(`${k}=?`);
        vals.push(fields[k]);
    }
    if (!sets.length) return getUserById(id);
    vals.push(id);
    await pool.query(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`, vals);
    return getUserById(id);
}

async function listUsers(limit = 100, offset = 0) {
    const pool = getPool();
    const [rows] = await pool.query(`SELECT id, email, name, role, isPremium, subscriptionExpiry, createdAt FROM users LIMIT ? OFFSET ?`, [Number(limit), Number(offset)]);
    return rows;
}

module.exports = { createUser, getUserByEmail, getUserById, updateUser, listUsers };
