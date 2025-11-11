const { getPool } = require('../config/db');

async function storeIdempotency(key, userId, requestHash, responseBody, expiresAt) {
    const pool = getPool();
    await pool.query(
        `INSERT INTO idempotency_keys (idempotencyKey, userId, requestHash, responseBody, expiresAt)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE responseBody = VALUES(responseBody)`,
        [key, userId, requestHash, JSON.stringify(responseBody), expiresAt] // stringify
    );
}

async function getIdempotency(key) {
    const pool = getPool();
    const [rows] = await pool.query(
        `SELECT * FROM idempotency_keys WHERE key_value = ? AND expiresAt > NOW()`,
        [key]
    );
    return rows[0] || null;
}

module.exports = { storeIdempotency, getIdempotency };
