import { Router } from 'express';
import { getDb } from '../db/index.js';
import { getQueryLog, clearQueryLog } from '../db/queryLog.js';

const router = Router();

function quoteIdent(name) {
  return `"${String(name).replace(/"/g, '""')}"`;
}

function tableNames(db) {
  const result = db.exec(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
  );
  if (!result.length) return [];
  return result[0].values.map((row) => row[0]);
}

function columnNames(db, table) {
  const result = db.exec(`PRAGMA table_info(${quoteIdent(table)})`);
  if (!result.length) return [];
  const nameIdx = result[0].columns.indexOf('name');
  return result[0].values.map((row) => row[nameIdx]);
}

function rowCount(db, table) {
  const result = db.exec(`SELECT COUNT(*) AS c FROM ${quoteIdent(table)}`);
  return result.length ? result[0].values[0][0] : 0;
}

// GET /api/sql/queries - list logged mutations (newest first)
router.get('/queries', (req, res) => {
  const { verb, endpoint, limit } = req.query;
  const queries = getQueryLog({ verb, endpoint, limit });
  res.json({ queries, count: queries.length });
});

// DELETE /api/sql/queries - clear the log
router.delete('/queries', (req, res) => {
  clearQueryLog();
  res.json({ message: 'Query log cleared' });
});

// GET /api/sql/tables - all tables with columns and row counts
router.get('/tables', async (req, res) => {
  try {
    const db = await getDb();
    const tables = tableNames(db).map((name) => ({
      name,
      rowCount: rowCount(db, name),
      columns: columnNames(db, name),
    }));
    res.json({ tables });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/sql/tables/:name - all rows of a table (paginated)
router.get('/tables/:name', async (req, res) => {
  try {
    const db = await getDb();
    const names = tableNames(db);
    const table = names.find((n) => n.toLowerCase() === req.params.name.toLowerCase());
    if (!table) {
      return res.status(404).json({ error: `Table '${req.params.name}' not found` });
    }

    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 100, 1), 500);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);

    const result = db.exec(`SELECT * FROM ${quoteIdent(table)} LIMIT ${limit} OFFSET ${offset}`);
    const columns = result.length ? result[0].columns : columnNames(db, table);
    const rows = result.length
      ? result[0].values.map((values) =>
          Object.fromEntries(columns.map((col, i) => [col, values[i]]))
        )
      : [];

    res.json({ name: table, columns, rows, total: rowCount(db, table), limit, offset });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
