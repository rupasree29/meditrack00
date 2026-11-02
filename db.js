/**
 * MediTrack - MySQL Database Connection Pool
 * Uses mysql2/promise for async/await execution.
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'meditrack',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection on launch
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL database:', process.env.DB_NAME || 'meditrack');
    connection.release();
    return true;
  } catch (err) {
    console.warn('⚠️ Warning: MySQL database connection failed:', err.message);
    console.warn('ℹ️ Ensure MySQL server is running and database "meditrack" is imported from /database/meditrack.sql');
    return false;
  }
}

testConnection();

module.exports = pool;
