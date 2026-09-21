import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { createSchema } from './schema.js';
import { seedData } from './seed.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = join(__dirname, 'hospital.db');

let db = null;

export async function getDb() {
  if (db) return db;

  const SQL = await initSqlJs();

  if (existsSync(DB_PATH)) {
    const buffer = readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  return db;
}

export async function initializeDb() {
  const db = await getDb();

  // Check if tables already exist
  const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name='EMPLOYEE'");

  if (!tables.length || !tables[0].values.length) {
    console.log('Creating database schema...');
    db.run(createSchema);

    console.log('Seeding database with initial data...');
    db.run(seedData);

    // Save the database
    saveDb();

    console.log('Database initialized successfully!');
  } else {
    console.log('Database already initialized.');
  }

  return db;
}

export function saveDb() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    writeFileSync(DB_PATH, buffer);
  }
}

export function closeDb() {
  if (db) {
    saveDb();
    db.close();
    db = null;
  }
}
