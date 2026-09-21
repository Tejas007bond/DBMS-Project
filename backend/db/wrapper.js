// Wrapper to make sql.js work with better-sqlite3 style API in routes

import { getDb, saveDb } from './index.js';

class DatabaseWrapper {
  constructor(db) {
    this.db = db;
  }

  prepare(sql) {
    const self = this;
    return {
      run(...params) {
        self.db.run(sql, params);
        saveDb();
      },
      get(...params) {
        const stmt = self.db.prepare(sql);
        stmt.bind(params);
        if (stmt.step()) {
          const cols = stmt.getColumnNames();
          const values = stmt.get();
          const row = {};
          cols.forEach((col, i) => { row[col] = values[i]; });
          stmt.free();
          return row;
        }
        stmt.free();
        return undefined;
      },
      all(...params) {
        const stmt = self.db.prepare(sql);
        stmt.bind(params);
        const results = [];
        while (stmt.step()) {
          const cols = stmt.getColumnNames();
          const values = stmt.get();
          const row = {};
          cols.forEach((col, i) => { row[col] = values[i]; });
          results.push(row);
        }
        stmt.free();
        return results;
      }
    };
  }

  exec(sql) {
    this.db.exec(sql);
    saveDb();
  }
}

let wrapper = null;

export async function getDbWrapper() {
  if (wrapper) return wrapper;
  const db = await getDb();
  wrapper = new DatabaseWrapper(db);
  return wrapper;
}
