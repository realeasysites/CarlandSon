'use strict';
const path = require('path');
const Database = require('better-sqlite3');

const db = new Database(process.env.DB_PATH || path.join(__dirname, '..', 'db', 'leads.db'));
db.pragma('journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    property_type TEXT,
    service TEXT,
    sqft TEXT,
    location TEXT,
    timeline TEXT,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'new',
    notes TEXT DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);
module.exports = db;
