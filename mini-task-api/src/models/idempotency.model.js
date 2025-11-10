const { getPool } = require('../config/db');

async function storeIdempotency(key, userId, requestHash, responseBody, expiresAt) {
    const pool = getPool();
    await pool.query(
        `INSERT INTO idempotency_keys (idempotencyKey, userId, requestHash, responseBody, expiresAt)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE responseBody = responseBody`,
        [key, userId, requestHash, JSON.stringify(responseBody), expiresAt]
    );
}

async function getIdempotency(key) {
    const pool = getPool();
    const [rows] = await pool.query(`SELECT * FROM idempotency_keys WHERE idempotencyKey = ?`, [key]);
    return rows[0] || null;
}

module.exports = { storeIdempotency, getIdempotency };
