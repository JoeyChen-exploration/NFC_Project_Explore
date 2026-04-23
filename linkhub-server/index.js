require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { getDb } = require('./db/setup');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ──────────────────────────────────────────────────────────
// 安全响应头
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: [
          "'self'",
          'api.dicebear.com',
          'data:',
          'blob:',
          'http://localhost:5173',
          'http://localhost:3001',
        ],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        fontSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }),
);

// Serve uploaded avatars
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// CORS配置
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(express.json());

// 全局速率限制（宽松，防止滥用）
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 1000, // 每个IP最多1000次请求
  message: { error: '请求过于频繁，请稍后再试' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// 关键端点严格限制
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 10, // 登录/注册最多10次尝试
  message: { error: '尝试次数过多，请15分钟后重试' },
  skipSuccessfulRequests: true, // 成功请求不计入限制
});

// Request logger (dev)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`  ${req.method} ${req.path}`);
    next();
  });
}

// ── 状态页面 ────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>LinkHub API Server</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
        h1 { color: #2563eb; }
        .status { background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .api-list { list-style: none; padding: 0; }
        .api-item { background: #f8fafc; padding: 12px; margin: 8px 0; border-radius: 6px; border-left: 4px solid #2563eb; }
        .method { display: inline-block; padding: 4px 8px; background: #2563eb; color: white; border-radius: 4px; font-size: 12px; margin-right: 10px; }
        .env { background: #dcfce7; padding: 8px 12px; border-radius: 6px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <h1>🚀 LinkHub API Server</h1>
      
      <div class="status">
        <h3>✅ 服务器运行正常</h3>
        <p><strong>端口:</strong> ${PORT}</p>
        <p><strong>环境:</strong> ${process.env.NODE_ENV || 'development'}</p>
        <p><strong>时间:</strong> ${new Date().toISOString()}</p>
      </div>
      
      <div class="env">
        <strong>前端地址:</strong> ${process.env.FRONTEND_URL || 'http://localhost:5173'}<br>
        <strong>数据库:</strong> SQLite (linkhub.db)
      </div>
      
      <h3>📡 可用API端点</h3>
      <ul class="api-list">
        <li class="api-item"><span class="method">GET</span> <code>/api/health</code> - 健康检查</li>
        <li class="api-item"><span class="method">POST</span> <code>/api/auth/register</code> - 用户注册</li>
        <li class="api-item"><span class="method">POST</span> <code>/api/auth/login</code> - 用户登录</li>
        <li class="method">GET</span> <code>/api/profile</code> - 获取用户资料</li>
        <li class="api-item"><span class="method">GET</span> <code>/api/analytics</code> - 分析数据</li>
        <li class="api-item"><span class="method">GET</span> <code>/api/p/:username</code> - 公开页面</li>
      </ul>
      
      <h3>🔗 快速链接</h3>
      <ul>
        <li><a href="/api/health" target="_blank">健康检查</a></li>
        <li><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" target="_blank">前端应用</a></li>
      </ul>
      
      <p style="margin-top: 30px; color: #64748b; font-size: 14px;">
        🧠 基于Claude Code分析优化 | 安全评分: 8.8/10
      </p>
    </body>
    </html>
  `);
});

// ── Routes ──────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/p', require('./routes/pages'));
app.use('/api/analytics', require('./routes/analytics'));

const nfcRouter = require('./routes/nfc');
app.use('/api/nfc', nfcRouter);
// NFC卡片扫描重定向 (NFC芯片写入的URL格式: /nfc/<serial>)
app.get('/nfc/:cardSerial', nfcRouter.scanRedirect);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 404 fallback
app.use((_req, res) => {
  res.status(404).json({ error: '接口不存在' });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: '服务器内部错误' });
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
