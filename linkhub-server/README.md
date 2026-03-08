# LinkHub — Backend API

Node.js + Express + SQLite REST API，为 LinkHub 个人主页构建器提供服务。

## 快速启动

```bash
# 1. 安装依赖
npm install

# 2. 复制环境变量
cp .env.example .env

# 3. 启动开发服务器
npm run dev
```

服务运行于 `http://localhost:3001`

---

## API 文档

### 🔐 认证

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/register` | 注册新用户 |
| POST | `/api/auth/login` | 登录获取 token |
| GET  | `/api/auth/me` | 获取当前用户 🔒 |

**注册请求体：**
```json
{
  "email": "hello@example.com",
  "username": "yuki",
  "password": "123456"
}
```

**登录请求体：**
```json
{
  "email": "hello@example.com",
  "password": "123456"
}
```

**响应（含 token）：**
```json
{
  "token": "eyJhbG...",
  "user": { "id": "...", "email": "...", "username": "yuki" }
}
```

> 🔒 受保护路由需在 Header 中传入：`Authorization: Bearer <token>`

---

### 👤 个人资料（需登录）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET    | `/api/profile`               | 获取完整资料 |
| PUT    | `/api/profile`               | 更新基本资料 |
| PUT    | `/api/profile/socials`       | 更新社交账号 |
| POST   | `/api/profile/links`         | 添加链接 |
| PUT    | `/api/profile/links/:id`     | 修改链接 |
| DELETE | `/api/profile/links/:id`     | 删除链接 |
| PUT    | `/api/profile/links/reorder` | 拖拽排序 |

---

### 🌐 公开主页（无需登录）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET  | `/api/p/:username`        | 获取用户公开主页数据 |
| POST | `/api/p/:username/click`  | 记录链接点击 |

---

### 📊 数据分析（需登录）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/analytics` | 获取访问/点击统计 |

**响应示例：**
```json
{
  "summary": {
    "total_page_views": 142,
    "total_link_clicks": 58
  },
  "clicks_per_link": [
    { "label": "我的博客", "url": "...", "clicks": 32 }
  ],
  "daily_views_7d": [
    { "date": "2026-03-01", "count": 18 }
  ]
}
```

---

## 数据库结构

```
users          — 用户账号
profiles       — 个人资料（name, bio, theme, embed）
links          — 自定义链接列表
socials        — 社交媒体账号
analytics      — 访问/点击事件日志
```

数据库文件保存为 `db/linkhub.db`（SQLite）。
迁移至 PostgreSQL 只需替换 `db/setup.js` 中的连接层。

---

## 项目结构

```
linkhub-server/
├── index.js              # 入口，Express 服务器
├── .env.example          # 环境变量模板
├── db/
│   └── setup.js          # 数据库初始化 + 查询工具
├── middleware/
│   └── auth.js           # JWT 验证中间件
└── routes/
    ├── auth.js           # 注册/登录
    ├── profile.js        # 资料/链接管理
    ├── pages.js          # 公开主页
    └── analytics.js      # 数据统计
```

## 后续扩展方向

- [ ] 图片上传（头像）→ 接入 Cloudflare R2 / AWS S3
- [ ] 自定义域名支持
- [ ] 邮件验证
- [ ] 迁移至 PostgreSQL（生产环境）
- [ ] Rate limiting（防刷接口）
