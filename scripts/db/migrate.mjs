import fs from 'node:fs';
import path from 'node:path';
import mysql from 'mysql2/promise';

const host = process.env.DB_HOST ?? 'localhost';
const port = Number(process.env.DB_PORT ?? 3306);
const user = process.env.DB_USER ?? 'root';
const password = process.env.DB_PASSWORD ?? '';
const database = process.env.DB_NAME ?? 'staffy';
const migrationDir = path.resolve(process.cwd(), 'src/server/database/migrations');

function getMigrationFiles() {
  if (!fs.existsSync(migrationDir)) {
    return [];
  }

  return fs
    .readdirSync(migrationDir)
    .filter((fileName) => fileName.endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

async function ensureDatabase(connection) {
  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
  );
}

async function ensureMigrationTable(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      filename VARCHAR(255) NOT NULL,
      applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_schema_migrations_filename (filename)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
}

async function runMigrations() {
  const connection = await mysql.createConnection({
    host,
    port,
    user,
    password,
  });

  await ensureDatabase(connection);
  await connection.end();

  const pool = mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    multipleStatements: true,
  });

  await ensureMigrationTable(pool);

  const files = getMigrationFiles();
  if (files.length === 0) {
    console.log('No migration files found.');
    await pool.end();
    return;
  }

  for (const fileName of files) {
    const [rows] = await pool.query(
      'SELECT id FROM schema_migrations WHERE filename = ? LIMIT 1',
      [fileName],
    );

    if (Array.isArray(rows) && rows.length > 0) {
      console.log(`Skipping ${fileName} (already applied)`);
      continue;
    }

    const migrationPath = path.join(migrationDir, fileName);
    const sql = fs.readFileSync(migrationPath, 'utf8').trim();

    if (!sql) {
      console.log(`Skipping ${fileName} (empty file)`);
      continue;
    }

    const transaction = await pool.getConnection();
    try {
      await transaction.beginTransaction();
      await transaction.query(sql);
      await transaction.query(
        'INSERT INTO schema_migrations (filename) VALUES (?)',
        [fileName],
      );
      await transaction.commit();
      console.log(`Applied ${fileName}`);
    } catch (error) {
      await transaction.rollback();
      throw error;
    } finally {
      transaction.release();
    }
  }

  await pool.end();
  console.log('Migrations completed successfully.');
}

runMigrations().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
