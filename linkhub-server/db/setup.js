const initSqlJs = require("sql.js");
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "linkhub.db");

let db;

async function getDb() {
  if (db) return db;

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  createTables();
  return db;
}

function saveDb() {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

function createTables() {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      reset_token TEXT DEFAULT NULL,
      reset_expires TEXT DEFAULT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Add reset columns to existing databases (no-op if already present)
  try { db.run("ALTER TABLE users ADD COLUMN reset_token TEXT DEFAULT NULL") } catch (_) {}
  try { db.run("ALTER TABLE users ADD COLUMN reset_expires TEXT DEFAULT NULL") } catch (_) {}

  db.run(`
    CREATE TABLE IF NOT EXISTS profiles (
      user_id TEXT PRIMARY KEY REFERENCES users(id),
      name TEXT DEFAULT '',
      bio TEXT DEFAULT '',
      avatar_seed INTEGER DEFAULT 1,
      theme_id TEXT DEFAULT 'midnight',
      embed_url TEXT DEFAULT '',
      show_embed INTEGER DEFAULT 0,
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS links (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      label TEXT NOT NULL,
      url TEXT NOT NULL,
      active INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS socials (
      user_id TEXT PRIMARY KEY REFERENCES users(id),
      instagram TEXT DEFAULT '',
      twitter TEXT DEFAULT '',
      github TEXT DEFAULT '',
      youtube TEXT DEFAULT '',
      tiktok TEXT DEFAULT '',
      website TEXT DEFAULT ''
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS analytics (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      link_id TEXT,
      event TEXT NOT NULL,
      ip TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  saveDb();
  console.log("✅ Database tables ready");
}

// Helper: run a query and return rows as objects
function query(sql, par