# LinkHub NFC电子名片系统 - 开发任务文档

## 📋 项目概述

### 项目状态

- **当前版本**: v1.0 (基础Link-in-Bio功能 + 安全优化)
- **质量评分**: 8.8/10 (基于Claude Code全面分析)
- **优化完成**: 安全加固、性能优化、代码质量工具链
- **一键启动**: 完整脚本支持 (`./start-linkhub.sh`)

### 技术栈

- **前端**: React 18 + Vite + 完整响应式设计
- **后端**: Node.js + Express + SQLite (sql.js)
- **工具链**: ESLint + Prettier + Husky + lint-staged
- **安全**: express-rate-limit + helmet + DOMPurify

### 项目位置

```
/Users/lobster_lab/.openclaw/workspace/nfc-project/NFC_Project_Explore/
├── linkhub-server/          # 后端 (已优化)
├── linkhub-frontend/        # 前端 (已优化)
└── DEVELOPMENT_TASKS.md     # 本文件
```

## 🎯 第二阶段开发目标：NFC电子名片功能

### 核心需求

1. **用户绑定NFC卡片**到个人账户
2. **NFC扫描重定向**到用户公开主页
3. **扫描数据统计**和分析
4. **卡片管理界面**（激活、停用、解绑）

### 目标用户

- **初期**: 20张测试卡片的澳大利亚用户
- **策略**: 免费层获取用户，付费功能变现
- **重点**: 学习体验和技术验证优先

---

## 📊 阶段1: NFC核心功能 (高优先级)

### 任务1.1: 数据库扩展

**文件**: `linkhub-server/db/setup.js`

```sql
-- NFC卡片表
CREATE TABLE IF NOT EXISTS nfc_cards (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  card_serial TEXT UNIQUE NOT NULL,      -- 物理序列号 (如: NTAG213-123456)
  card_name TEXT DEFAULT '',             -- 用户自定义名称 (如: "我的名片-办公室")
  activated_at DATETIME DEFAULT NULL,    -- 首次激活时间
  last_used_at DATETIME DEFAULT NULL,    -- 最后扫描时间
  scan_count INTEGER DEFAULT 0,          -- 总扫描次数
  active INTEGER DEFAULT 1,              -- 状态: 1=激活, 0=停用
  created_at DATETIME DEFAULT (datetime('now')),
  updated_at DATETIME DEFAULT (datetime('now'))
);

-- NFC扫描记录表
CREATE TABLE IF NOT EXISTS nfc_scans (
  id TEXT PRIMARY KEY,
  card_id TEXT REFERENCES nfc_cards(id) ON DELETE CASCADE,
  user_agent TEXT DEFAULT '',            -- 浏览器/设备信息
  ip TEXT DEFAULT '',                    -- 匿名化IP (已实现anonymizeIp函数)
  referrer TEXT DEFAULT '',              -- 来源页面
  location TEXT DEFAULT '',              -- 地理位置 (可选: 城市/国家)
  created_at DATETIME DEFAULT (datetime('now'))
);

-- 索引 (添加到现有createIndexes函数)
CREATE INDEX IF NOT EXISTS idx_nfc_cards_user_id ON nfc_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_nfc_cards_serial ON nfc_cards(card_serial);
CREATE INDEX IF NOT EXISTS idx_nfc_cards_active ON nfc_cards(active);
CREATE INDEX IF NOT EXISTS idx_nfc_scans_card_id ON nfc_scans(card_id);
CREATE INDEX IF NOT EXISTS idx_nfc_scans_created_at ON nfc_scans(created_at);
```

### 任务1.2: 后端API开发

**文件**: `linkhub-server/routes/nfc.js`

#### API端点设计

##### 1. 卡片管理API (需要认证 `authMiddleware`)

```
POST   /api/nfc/cards                   绑定新卡片
GET    /api/nfc/cards                   获取用户所有卡片
GET    /api/nfc/cards/:id               获取单张卡片详情
PUT    /api/nfc/cards/:id               更新卡片信息
DELETE /api/nfc/cards/:id               解绑卡片
POST   /api/nfc/cards/:id/regenerate    重新生成绑定 (安全重置)
```

##### 2. 扫描重定向API (公开)

```
GET    /nfc/:cardSerial                 NFC扫描重定向
```

##### 3. 分析数据API (需要认证)

```
GET    /api/nfc/analytics               获取用户所有卡片统计
GET    /api/nfc/cards/:id/analytics     获取单张卡片详细扫描数据
```

#### 安全要求

- 复用现有的 `authMiddleware` 和 `rateLimit` 配置
- 所有输入必须通过 `sanitizeUserInput` 和 `sanitizeHtml` 处理
- 卡片序列号格式验证 (支持常见NFC格式)
- 用户只能操作自己的卡片 (权限检查)

#### 性能要求

- 扫描重定向响应时间 < 100ms
- 批量查询使用索引优化
- 高频扫描记录使用批量插入

### 任务1.3: 前端界面开发

#### 1. NFC管理页面

**文件**: `linkhub-frontend/src/pages/NfcPage.jsx`

**功能**:

- 卡片列表展示 (表格或卡片视图)
- 绑定新卡片表单
- 卡片操作: 编辑名称、激活/停用、解绑
- 扫描统计展示 (图表)

**设计要求**:

- 响应式布局 (移动端优先)
- 使用现有主题系统
- 复用 `useScreenSize` 等自定义Hook
- 加载状态和错误处理

#### 2. 导航集成

**文件**: `linkhub-frontend/src/main.jsx`

```jsx
// 添加路由
<Route
  path="/nfc"
  element={
    <PrivateRoute>
      <NfcPage />
    </PrivateRoute>
  }
/>

// 在导航组件中添加菜单项
```

#### 3. 组件开发

```
linkhub-frontend/src/components/nfc/
├── NfcCard.jsx              # 单张卡片展示组件
├── BindCardModal.jsx        # 绑定卡片模态框
├── NfcAnalyticsChart.jsx    # 扫描数据图表
└── NfcScanTable.jsx         # 扫描记录表格
```

#### 4. API集成

**文件**: `linkhub-frontend/src/api.js`

```javascript
// NFC相关API
export const api = {
  // ... 现有API

  // NFC卡片管理
  nfc: {
    getCards: () => request('GET', '/nfc/cards'),
    getCard: (id) => request('GET', `/nfc/cards/${id}`),
    createCard: (data) => request('POST', '/nfc/cards', data),
    updateCard: (id, data) => request('PUT', `/nfc/cards/${id}`, data),
    deleteCard: (id) => request('DELETE', `/nfc/cards/${id}`),
    regenerateCard: (id) => request('POST', `/nfc/cards/${id}/regenerate`),
    getAnalytics: () => request('GET', '/nfc/analytics'),
    getCardAnalytics: (id) => request('GET', `/nfc/cards/${id}/analytics'),
  },
};
```

---

## 📈 阶段2: 用户体验优化 (中优先级)

### 任务2.1: 批量卡片管理

- CSV文件批量导入卡片序列号
- 批量激活/停用操作
- 批量导出卡片数据 (JSON/CSV)

### 任务2.2: 扫描通知系统

- 实时扫描推送通知 (可选)
- 异常扫描检测 (频率、地理位置)
- 每日/每周扫描报告

### 任务2.3: 兼容性工具

- NFC卡片格式验证工具
- 批量URL生成器 (用于卡片打印)
- 兼容性检查清单

---

## 🇦🇺 阶段3: 澳大利亚市场适配 (中优先级)

### 任务3.1: 本地化

- 时区处理 (Australia/Sydney)
- 日期/时间格式本地化
- 地址和联系方式格式

### 任务3.2: 合规性

- 澳大利亚隐私法 (Privacy Act 1988) 合规声明
- 数据存储位置说明 (AWS Sydney region)
- 用户数据导出功能 (GDPR-like)

### 任务3.3: 支付集成准备

- Stripe Australia账户配置
- 定价策略设计 (免费层 + 付费功能)
- 发票和GST处理

---

## 🔧 技术要求

### 代码质量

1. **复用现有配置**: ESLint、Prettier、Husky规则
2. **组件化设计**: 单一职责，可复用组件
3. **错误处理**: 统一的错误边界和用户提示
4. **测试覆盖**: 核心功能单元测试

### 安全标准

1. **输入验证**: 所有用户输入必须验证
2. **权限检查**: 用户只能访问自己的数据
3. **审计日志**: 重要操作记录日志
4. **速率限制**: 所有API端点必须有限制

### 性能指标

1. **页面加载**: 移动端 < 3秒
2. **API响应**: p95 < 200ms
3. **数据库查询**: 所有查询必须使用索引

---

## 📋 开发规范

### 文件命名

- 组件: `PascalCase.jsx`
- Hook: `useCamelCase.js`
- 工具函数: `camelCase.js`
- 测试文件: `ComponentName.test.jsx`

### 代码风格

- 使用现有 `.eslintrc.cjs` 和 `.prettierrc` 配置
- 组件使用函数式组件 + Hooks
- 状态管理优先使用 React state 和 context
- 复杂逻辑提取为自定义Hook

### 提交规范

- 使用现有 Husky 预提交钩子
- 提交信息格式: `feat(nfc): 添加卡片绑定功能`
- 类型: feat, fix, docs, style, refactor, test, chore

---

## 🚀 开始开发指南

### 步骤1: 环境准备

```bash
cd /Users/lobster_lab/.openclaw/workspace/nfc-project/NFC_Project_Explore

# 启动开发环境
./start-linkhub.sh  # 或使用项目根目录的一键启动脚本

# 验证现有功能
# 前端: http://localhost:5173
# 后端: http://localhost:3001
```

### 步骤2: 数据库扩展

1. 修改 `linkhub-server/db/setup.js`
2. 添加NFC相关表结构
3. 更新索引创建函数
4. 重启服务器验证表创建

### 步骤3: 后端API开发

1. 创建 `linkhub-server/routes/nfc.js`
2. 实现所有API端点
3. 集成到主路由 (`index.js`)
4. 测试API功能 (使用curl或Postman)

### 步骤4: 前端界面开发

1. 创建NFC相关组件
2. 集成到现有路由系统
3. 连接后端API
4. 测试完整用户流程

### 步骤5: 测试和优化

1. 功能测试 (手动)
2. 性能测试 (加载时间、API响应)
3. 安全测试 (权限、输入验证)
4. 移动端测试 (响应式设计)

---

## 📞 技术参考

### 现有代码库关键文件

1. **认证中间件**: `linkhub-server/middleware/auth.js`
2. **数据库工具**: `linkhub-server/db/setup.js`
3. **输入验证**: `linkhub-server/utils/validation.js`
4. **前端路由**: `linkhub-frontend/src/main.jsx`
5. **API客户端**: `linkhub-frontend/src/api.js`
6. **响应式设计**: `linkhub-frontend/src/responsive.css`

### 安全最佳实践 (已实现)

1. **速率限制**: `express-rate-limit` 配置
2. **安全头**: `helmet` CSP策略
3. **XSS防护**: `DOMPurify` HTML清理
4. **SQL注入防护**: 参数化查询
5. **JWT安全**: 环境变量验证

### 性能优化 (已实现)

1. **数据库索引**: 关键查询字段索引
2. **查询合并**: 减少数据库往返
3. **懒加载**: React.lazy代码分割
4. **缓存策略**: 浏览器缓存配置

---

## 🎯 验收标准

### 功能验收

- [ ] 用户可成功绑定NFC卡片
- [ ] NFC扫描正确重定向到用户主页
- [ ] 扫描数据准确记录和统计
- [ ] 卡片管理操作正常 (激活、停用、解绑)
- [ ] 移动端界面完整可用

### 性能验收

- [ ] 扫描重定向响应时间 < 100ms
- [ ] 管理页面加载时间 < 2秒
- [ ] 数据库查询全部使用索引
- [ ] 移动端体验流畅

### 安全验收

- [ ] 所有API端点有速率限制
- [ ] 用户只能操作自己的数据
- [ ] 输入验证和输出编码完整
- [ ] 敏感信息不泄露

### 代码质量

- [ ] 通过ESLint检查
- [ ] Prettier格式化一致
- [ ] 组件职责单一
- [ ] 有基本的错误处理

---

## 💡 扩展思考

### 未来功能规划

1. **NFC卡片模板**: 不同设计风格的卡片模板
2. **团队管理**: 企业用户多卡片管理
3. **API开放**: 第三方集成支持
4. **数据分析**: 高级扫描数据分析

### 技术演进

1. **数据库迁移**: SQLite → PostgreSQL (用户增长时)
2. **缓存层**: Redis缓存高频数据
3. **实时推送**: WebSocket实时通知
4. **微服务**: 功能模块拆分

### 商业模式

1. **免费层**: 基础功能免费，吸引用户
2. **专业版**: 高级分析、批量管理
3. **企业版**: 团队管理、API访问
4. **增值服务**: 卡片设计、打印服务

---

**开始时间**: 2026-04-19  
**预计完成**: 3-5天 (分阶段交付)  
**优先级**: 阶段1 > 阶段2 > 阶段3

**开发原则**: 质量优先，安全第一，用户体验为核心
