import mysql, { Pool } from 'mysql2/promise';

let pool: Pool | null = null;

function buildPool(): Pool {
  const host = process.env['DB_HOST'] ?? 'localhost';
  const port = Number(process.env['DB_PORT'] ?? 3306);
  const user = process.env['DB_USER'] ?? 'root';
  const password = process.env['DB_PASSWORD'] ?? '';
  const database = process.env['DB_NAME'] ?? 'staffy';

  return mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
}

export function getDbPool(): Pool {
  if (!pool) {
    pool = buildPool();
  }

  return pool;
}
