// In-memory log of SQL mutations (INSERT / UPDATE / DELETE) executed by the API.
// Used by the SQL Explorer page to show the queries triggered by add/delete actions.
import { AsyncLocalStorage } from 'node:async_hooks';

// Holds the current request context so each logged query can be tied to an endpoint.
export const queryContext = new AsyncLocalStorage();

const MAX_ENTRIES = 300;
const entries = [];
let nextId = 1;

function verbOf(sql) {
  const match = /^\s*([a-zA-Z]+)/.exec(sql);
  return match ? match[1].toUpperCase() : 'SQL';
}

export function recordQuery(sql, params = [], rowCount = 0) {
  const normalized = String(sql).replace(/\s+/g, ' ').trim();
  const ctx = queryContext.getStore() || {};
  const entry = {
    id: nextId++,
    timestamp: new Date().toISOString(),
    verb: verbOf(normalized),
    endpoint: ctx.path ? `${ctx.method} ${ctx.path}` : null,
    method: ctx.method || null,
    path: ctx.path || null,
    sql: normalized,
    params: Array.isArray(params) ? params : [params],
    rowCount,
  };

  entries.unshift(entry); // newest first
  if (entries.length > MAX_ENTRIES) entries.length = MAX_ENTRIES;
  return entry;
}

export function getQueryLog({ verb, endpoint, limit } = {}) {
  let result = entries;
  if (verb) result = result.filter((e) => e.verb === String(verb).toUpperCase());
  if (endpoint) {
    const needle = String(endpoint).toLowerCase();
    result = result.filter((e) => (e.endpoint || '').toLowerCase().includes(needle));
  }
  if (limit) result = result.slice(0, Number(limit));
  return result;
}

export function clearQueryLog() {
  entries.length = 0;
}

export function queryLogSize() {
  return entries.length;
}
