const mysql = require('mysql2/promise');

let pool;

async function initDb() {
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER || 'taskuser',
    password: process.env.DB_PASSWORD || 'taskpass',
    database: process.env.DB_NAME || 'taskdb',
    waitForConnections: true,
    connectionLimit: 10,
    timezone: '+00:00',
    decimalNumbers: true
  });

  // quick test
  const conn = await pool.getConnection();
  await conn.ping();
  conn.release();
  console.log('Connected to MySQL');
}

function getPool() {
  if (!pool) throw new Error('DB not initialized. Call initDb first.');
  return pool;
}

module.exports = { initDb, getPool };
