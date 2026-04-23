const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'linkhub.db');

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
  try {
    db.run('ALTER TABLE users ADD COLUMN reset_token TEXT DEFAULT NULL');
  } catch (_) {}
  try {
    db.run('ALTER TABLE users ADD COLUMN reset_expires TEXT DEFAULT NULL');
  } catch (_) {}

  db.run(`
    CREATE TABLE IF NOT EXISTS profiles (
      user_id TEXT PRIMARY KEY REFERENCES users(id),
      name TEXT DEFAULT '',
      bio TEXT DEFAULT '',
      avatar_seed INTEGER DEFAULT 1,
      avatar_url TEXT DEFAULT '',
      theme_id TEXT DEFAULT 'midnight',
      embed_url TEXT DEFAULT '',
      show_embed INTEGER DEFAULT 0,
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);
  try {
    db.run("ALTER TABLE profiles ADD COLUMN avatar_url TEXT DEFAULT ''");
  } catch (_) {}

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
    CREATE TABLE IF NOT EXISTS published_profiles (
      user_id TEXT PRIMARY KEY REFERENCES users(id),
      name TEXT DEFAULT '',
      bio TEXT DEFAULT '',
      avatar_seed INTEGER DEFAULT 1,
      avatar_url TEXT DEFAULT '',
      theme_id TEXT DEFAULT 'midnight',
      embed_url TEXT DEFAULT '',
      show_embed INTEGER DEFAULT 0,
      published_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS published_socials (
      user_id TEXT PRIMARY KEY REFERENCES users(id),
      instagram TEXT DEFAULT '',
      twitter TEXT DEFAULT '',
      github TEXT DEFAULT '',
      youtube TEXT DEFAULT '',
      tiktok TEXT DEFAULT '',
      website TEXT DEFAULT '',
      published_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS published_links (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      label TEXT NOT NULL,
      url TEXT NOT NULL,
      active INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      published_at TEXT DEFAULT (datetime('now'))
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

  db.run(`
    CREATE TABLE IF NOT EXISTS nfc_cards (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      card_serial TEXT UNIQUE NOT NULL,
      card_name TEXT DEFAULT '',
      activated_at TEXT DEFAULT NULL,
      last_used_at TEXT DEFAULT NULL,
      scan_count INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS nfc_scans (
      id TEXT PRIMARY KEY,
      card_id TEXT NOT NULL REFERENCES nfc_cards(id) ON DELETE CASCADE,
      user_agent TEXT DEFAULT '',
      ip TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // 创建索引以提高查询性能
  createIndexes();

  // Backfill published snapshot for existing users (idempotent)
  db.run(`
    INSERT OR IGNORE INTO published_profiles (
      user_id, name, bio, avatar_seed, avatar_url, theme_id, embed_url, show_embed
    )
    SELECT
      p.user_id, p.name, p.bio, p.avatar_seed, p.avatar_url, p.theme_id, p.embed_url, p.show_embed
    FROM profiles p
  `);

  db.run(`
    INSERT OR IGNORE INTO published_socials (
      user_id, instagram, twitter, github, youtube, tiktok, website
    )
    SELECT
      s.user_id, s.instagram, s.twitter, s.github, s.youtube, s.tiktok, s.website
    FROM socials s
  `);

  db.run(`
    INSERT OR IGNORE INTO published_links (
      id, user_id, label, url, active, sort_order, created_at
    )
    SELECT
      l.id, l.user_id, l.label, l.url, l.active, l.sort_order, l.created_at
    FROM links l
  `);

  saveDb();
  console.log('✅ Database tables ready');
}

function createIndexes() {
  // 用户表索引
  db.run('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
  db.run('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)');

  // 链接表索引
  db.run('CREATE INDEX IF NOT EXISTS idx_links_user_id ON links(user_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_links_sort_order ON links(sort_order)');

  // 分析数据表索引
  db.run('CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_analytics_event ON analytics(event)');
  db.run('CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at)');
  db.run('CREATE INDEX IF NOT EXISTS idx_analytics_user_event ON analytics(user_id, event)');

  // NFC索引
  db.run('CREATE INDEX IF NOT EXISTS idx_nfc_cards_user_id ON nfc_cards(user_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_nfc_cards_serial ON nfc_cards(card_serial)');
  db.run('CREATE INDEX IF NOT EXISTS idx_nfc_scans_card_id ON nfc_scans(card_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_nfc_scans_created_at ON nfc_scans(created_at)');

  // Published snapshot indexes
  db.run('CREATE INDEX IF NOT EXISTS idx_published_links_user_id ON published_links(user_id)');
  db.run(
    'CREATE INDEX IF NOT EXISTS idx_published_links_user_sort ON published_links(user_id, sort_order)',
  );

  console.log('✅ Database indexes created');
}

/**
 * 清理旧的分析数据（保留最近90天）
 * 应该在定期任务中调用
 */
function cleanupOldAnalytics() {
  try {
    const result = db.run("DELETE FROM analytics WHERE created_at < datetime('now', '-90 days')");
    if (result.changes > 0) {
      console.log(`🧹 清理了 ${result.changes} 条旧分析数据（超过90天）`);
    }
  } catch (err) {
    console.error('清理分析数据失败:', err);
  }
}

// 导出清理函数
module.exports.cleanupOldAnalytics = cleanupOldAnalytics;

// Helper: run a query and return rows as objects
function query(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

// Helper: run insert/update/delete
function run(sql, params = []) {
  db.run(sql, params);
  saveDb();
}

// Helper: run multiple operations in a single transaction (one saveDb at end)
function transaction(fn) {
  db.run('BEGIN');
  try {
    const rawRun = (sql, params = []) => db.run(sql, params);
    const result = fn({ run: rawRun, query });
    db.run('COMMIT');
    saveDb();
    return result;
  } catch (err) {
    try {
      db.run('ROLLBACK');
    } catch (_) {}
    throw err;
  }
}

module.exports = { getDb, query, run, transaction, saveDb };
