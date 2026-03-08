require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { getDb } = require("./db/setup");

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ──────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

// Request logger (dev)
if (process.env.NODE_ENV !== "production") {
  app.use((req, _res, next) => {
    console.log(`  ${req.method} ${req.path}`);
    next();
  });
}

// ── Routes ──────────────────────────────────────────────────────────────
app.use("/api/auth", require("./routes/auth"));
app.use("/api/profile", require("./routes/profile"));
app.use("/api/p", require("./routes/pages"));
app.use("/api/analytics", require("./routes/analytics"));

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// 404 fallback
app.use((_req, res) => {
  res.status(404).json({ error: "接口不存在" });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "服务器内部错误" });
});

// ── Start ───────────────────────────────────────────────────────────────
async function start() {
  await getDb(); // initialize DB and create tables
  app.listen(PORT, () => {
    console.log(`\n🚀 LinkHub API running at http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/api/health\n`);
  });
}

start().catch(console.error);
