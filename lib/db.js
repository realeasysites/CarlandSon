'use strict';
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'db', 'leads.db');
fs.mkdirSync(path.dirname(dbPath), { recursive: true }); // git doesn't keep empty folders, so create it on boot
const db = new Database(dbPath);
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
