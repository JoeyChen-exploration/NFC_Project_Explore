# LinkHub — 个人 Link-in-Bio 主页构建器

> 让每个人都能在 60 秒内拥有自己的个性化主页。

用户访问 `yourdomain.com/dashboard` 编辑个人资料、链接和主题，
公开主页发布在 `yourdomain.com/:username`，带有访问量和点击追踪。

---

## 📸 功能一览

| 功能 | 说明 |
|------|------|
| 注册 / 登录 | Email + 密码，JWT 鉴权，30 天免登录 |
| 忘记密码 | 邮箱申请重置链接，token 有效期 1 小时 |
| 修改密码 | 登录后在「账号」tab 验证旧密码后修改 |
| 编辑器 | 实时预览双栏，失焦自动保存 |
| 自定义头像 | DiceBear 随机风格，点击一键更换 |
| 自定义链接 | 最多 20 条，可开关、可排序 |
| 社交账号 | 6 个平台图标自动显示 |
| 嵌入组件 | Spotify / YouTube / 任意 iframe |
| 6 套主题 | 午夜 / 日落 / 森林 / 奶油 / 海洋 / 黑白 |
| 公开主页 | `/:username` 路由，SEO 友好 |
| 数据分析 | 7 天访问趋势图 + 链接点击排行 |

---

## 🗂 项目结构

```
linkhub/
├── linkhub-server/          # 后端 (Node.js + Express + SQLite)
│   ├── index.js             # Express 入口，注册路由和中间件
│   ├── .env.example         # 环境变量模板
│   ├── db/
│   │   └── setup.js         # SQLite 初始化、建表、query/run 工具函数
│   ├── middleware/
│   │   └── auth.js          # JWT 签发 (signToken) 和验证 (authMiddleware)
│   └── routes/
│       ├── auth.js          # POST /register  POST /login  GET /me
│       ├── profile.js       # GET/PUT /profile  CRUD /profile/links  PUT /socials
│       ├── pages.js         # GET /p/:username  POST /p/:username/click
│       └── analytics.js     # GET /analytics
│
└── linkhub-frontend/        # 前端 (React 18 + Vite)
    ├── index.html           # HTML 入口，加载 Google Fonts
    ├── vite.config.js       # Vite 配置，/api 代理到后端 3001
    ├── package.json
    └── src/
        ├── main.jsx         # 路由入口 (BrowserRouter)
        ├── api.js           # 所有 fetch 封装，自动带 JWT header
        ├── hooks/
        │   └── useAuth.jsx  # AuthContext：user / login / logout
        ├── components/
        │   ├── themes.jsx   # THEMES 常量 + SOCIAL_ICONS SVG
        │   └── ProfilePreview.jsx  # 公用主页渲染组件（编辑器 + 公开页复用）
        └── pages/
            ├── AuthPage.jsx      # 登录 / 注册页
            ├── EditorPage.jsx    # /dashboard 编辑器
            ├── PublicPage.jsx    # /:username 公开主页
            └── AnalyticsPage.jsx # /analytics 数据分析仪表盘
```

---

## 🚀 本地运行

### 前置条件

- Node.js `>= 18`
- npm `>= 9`

### 第一步：启动后端

```bash
cd linkhub-server

# 安装依赖
npm install

# 复制并编辑环境变量
cp .env.example .env
# 重要：把 .env 里的 JWT_SECRET 改成一个长随机字符串

# 启动（开发模式，文件变更自动重启）
npm run dev
```

后端运行于 **http://localhost:3001**
数据库文件自动生成于 `db/linkhub.db`

### 第二步：启动前端

```bash
cd linkhub-frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端运行于 **http://localhost:5173**
Vite 已配置将 `/api/*` 请求代理到 `http://localhost:3001`，开发时无需处理跨域。

### 访问页面

| URL | 说明 |
|-----|------|
| `http://localhost:5173/login` | 注册 / 登录 |
| `http://localhost:5173/dashboard` | 编辑器（需登录）|
| `http://localhost:5173/analytics` | 数据分析（需登录）|
| `http://localhost:5173/:username` | 任意用户公开主页 |

---

## ⚙️ 环境变量说明

**`linkhub-server/.env`**

```env
PORT=3001                    # 后端端口
NODE_ENV=development         # development | production
JWT_SECRET=换成你自己的随机字符串   # ⚠️ 生产必须修改
FRONTEND_URL=http://localhost:5173  # CORS 白名单
```

> ⚠️ **生产环境务必修改 `JWT_SECRET`**，建议使用 `openssl rand -base64 32` 生成。

---

## 🏗 生产部署

### 后端构建

```bash
cd linkhub-server
NODE_ENV=production JWT_SECRET=<your-secret> node index.js
```

**推荐方案：** 使用 [Railway](https://railway.app) 或 [Render](https://render.com) 一键部署，挂载持久化卷存放 `linkhub.db`。

### 前端构建

```bash
cd linkhub-frontend
npm run build        # 输出到 dist/
```

将 `dist/` 部署到 Vercel / Netlify / Cloudflare Pages，并配置环境变量：

```
VITE_API_BASE=https://your-backend-domain.com
```

同时修改 `vite.config.js` 的 proxy 为生产后端地址，或在 `api.js` 中将 `BASE` 改为 `import.meta.env.VITE_API_BASE`。

### Nginx 示例（自托管）

```nginx
# 前端静态文件
server {
  listen 80;
  server_name yourdomain.com;
  root /var/www/linkhub/dist;
  index index.html;

  # 所有路由回退到 index.html（SPA）
  location / {
    try_files $uri $uri/ /index.html;
  }

  # 反向代理后端
  location /api/ {
    proxy_pass http://localhost:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
```

---

## 🗃 数据库表说明

| 表 | 用途 |
|----|------|
| `users` | 账号（id, email, username, password_hash, reset_token, reset_expires） |
| `profiles` | 资料（name, bio, avatar_seed, theme_id, embed_url） |
| `links` | 链接列表（label, url, active, sort_order） |
| `socials` | 社交账号（instagram, twitter, github …） |
| `analytics` | 事件日志（page_view, link_click, ip） |

当前使用 **SQLite**（`sql.js`，纯 JS 实现，无需编译）。  
迁移至 PostgreSQL 只需替换 `db/setup.js` 中的连接层，所有路由代码不变。

---

## 🔌 API 速查

所有 🔒 路由需要 Header：`Authorization: Bearer <token>`

```
POST   /api/auth/register          注册
POST   /api/auth/login             登录
GET    /api/auth/me            🔒  获取当前用户
POST   /api/auth/forgot-password   申请密码重置（发送重置链接）
POST   /api/auth/reset-password    凭 token 重置密码
PUT    /api/auth/change-password 🔒 登录后修改密码

GET    /api/profile            🔒  获取完整资料
PUT    /api/profile            🔒  更新基本资料
PUT    /api/profile/socials    🔒  更新社交账号
POST   /api/profile/links      🔒  添加链接
PUT    /api/profile/links/:id  🔒  修改链接
DELETE /api/profile/links/:id  🔒  删除链接
PUT    /api/profile/links/reorder 🔒 拖拽排序

GET    /api/p/:username            公开主页数据
POST   /api/p/:username/click      记录链接点击

GET    /api/analytics          🔒  访问 / 点击统计
```

---

## 📋 注意事项

1. **SQLite 并发限制**  
   `sql.js` 在每次写操作后将数据库序列化到磁盘，高并发时性能有限。用户数超过几千后建议迁移到 PostgreSQL。

2. **JWT Secret**
   `JWT_SECRET` 一旦修改，所有已登录用户的 token 立即失效，需重新登录。生产环境请妥善保管。

3. **密码重置邮件**
   当前开发模式下，`POST /api/auth/forgot-password` 会在 API 响应中直接返回 `dev_reset_url`，并在服务器控制台打印重置链接，无需配置邮件服务即可测试。
   生产环境请接入邮件服务（如 Nodemailer + SMTP / SendGrid），将重置链接通过邮件发送，并**移除**响应体中的 `dev_reset_url` 字段。重置 token 有效期为 **1 小时**，使用后立即失效。

4. **CORS 配置**
   `FRONTEND_URL` 必须与前端实际部署地址完全匹配（含协议和端口），否则浏览器会拦截请求。

5. **iframe 嵌入安全**
   部分网站（如 Twitter/X）禁止被 iframe 嵌入，建议在 UI 中对用户给出提示。

6. **头像上传**
   当前使用 DiceBear 随机头像，生产环境建议接入文件上传服务（Cloudflare R2 / AWS S3）并在 `profiles` 表新增 `avatar_url` 字段。

7. **Rate Limiting**
   公开接口（`/api/p/:username`）建议加 `express-rate-limit`，防止爬虫刷访问量数据。

---

## 🛣 后续扩展方向

- [ ] 真实头像上传（Cloudflare R2）
- [ ] 自定义域名绑定
- [ ] 注册邮件验证
- [ ] 密码重置接入真实邮件服务（Nodemailer / SendGrid）
- [ ] 链接拖拽排序（前端 DnD）
- [ ] 更多主题 / 自定义颜色选择器
- [ ] PostgreSQL 迁移
- [ ] API Rate Limiting
- [ ] 管理员后台

---

## 📄 License

MIT
