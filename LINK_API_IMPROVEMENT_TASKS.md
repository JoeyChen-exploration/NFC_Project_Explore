# 链接API改进任务文档

## 📊 当前状态分析

### 已实现的链接API

1. **GET /api/profile** - 获取用户资料和链接列表
2. **POST /api/profile/links** - 添加新链接
3. **PUT /api/profile/links/:linkId** - 更新链接
4. **DELETE /api/profile/links/:linkId** - 删除链接
5. **PUT /api/profile/links/reorder** - 拖拽排序

### 前端API调用

```javascript
// 现有API方法
addLink:       (body) => request('POST', '/profile/links', body),
updateLink:    (id, body) => request('PUT',  `/profile/links/${id}`, body),
deleteLink:    (id)       => request('DELETE', `/profile/links/${id}`),
reorderLinks:  (order)    => request('PUT',  '/profile/links/reorder', { order }),
```

### 数据库结构

```sql
CREATE TABLE links (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  active INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT (datetime('now')),
  updated_at DATETIME DEFAULT (datetime('now'))
);
```

## 🎯 改进目标

### 功能改进

1. **链接激活/停用API**: 专门的激活/停用端点
2. **批量操作API**: 批量更新、删除、激活/停用
3. **链接验证增强**: 更严格的URL验证和安全性检查
4. **链接分析功能**: 点击统计和性能监控
5. **用户体验优化**: 链接预览和智能建议

### 技术改进

1. **API设计一致性**: 统一的响应格式和错误处理
2. **性能优化**: 批量操作减少数据库往返
3. **安全性增强**: 输入验证和恶意链接检测
4. **可扩展性**: 为未来功能预留接口

## 📋 具体改进任务

### 任务1: 创建专门的链接激活/停用API

**文件**: `linkhub-server/routes/profile.js`

**新增端点**:

- `PUT /api/profile/links/:linkId/toggle` - 切换链接激活状态
- `PUT /api/profile/links/:linkId/activate` - 激活链接
- `PUT /api/profile/links/:linkId/deactivate` - 停用链接

**功能要求**:

- 切换链接的`active`状态 (1/0)
- 返回更新后的链接状态
- 验证用户权限
- 错误处理和日志记录

**接口设计**:

```javascript
// 请求: PUT /api/profile/links/:linkId/toggle
// 响应: { success: true, link: { id, label, url, active } }

// 请求: PUT /api/profile/links/:linkId/activate
// 响应: { success: true, link: { id, label, url, active: true } }

// 请求: PUT /api/profile/links/:linkId/deactivate
// 响应: { success: true, link: { id, label, url, active: false } }
```

### 任务2: 创建批量链接操作API

**文件**: `linkhub-server/routes/profile.js`

**新增端点**:

- `PUT /api/profile/links/batch/update` - 批量更新链接
- `PUT /api/profile/links/batch/toggle` - 批量切换激活状态
- `DELETE /api/profile/links/batch` - 批量删除链接

**功能要求**:

- 支持同时操作多个链接
- 使用事务确保数据一致性
- 验证所有链接属于当前用户
- 返回批量操作结果统计

**接口设计**:

```javascript
// 批量更新请求
PUT /api/profile/links/batch/update
Body: {
  updates: [
    { id: 'link1', label: '新标题', url: 'https://new-url.com' },
    { id: 'link2', active: false }
  ]
}
响应: {
  success: true,
  updated: 2,
  failed: 0,
  results: [
    { id: 'link1', success: true },
    { id: 'link2', success: true }
  ]
}

// 批量切换请求
PUT /api/profile/links/batch/toggle
Body: { ids: ['link1', 'link2', 'link3'] }
响应: {
  success: true,
  toggled: 3,
  results: [
    { id: 'link1', active: true },
    { id: 'link2', active: false },
    { id: 'link3', active: true }
  ]
}

// 批量删除请求
DELETE /api/profile/links/batch
Body: { ids: ['link1', 'link2'] }
响应: {
  success: true,
  deleted: 2,
  results: [
    { id: 'link1', success: true },
    { id: 'link2', success: true }
  ]
}
```

### 任务3: 增强链接验证功能

**文件**: `linkhub-server/utils/validation.js`

**新增功能**:

1. **URL格式验证增强**
   - 支持更多URL协议 (http, https, mailto, tel, etc.)
   - 域名黑名单检查
   - SSL证书验证 (对https链接)
   - URL长度限制

2. **链接安全性检查**
   - 恶意链接检测 (使用外部API或本地规则)
   - 钓鱼网站检测
   - 成人内容过滤
   - 垃圾链接识别

3. **链接去重检查**
   - 防止添加重复URL
   - 相似URL检测
   - 规范化URL比较

**实现要求**:

```javascript
// 新增验证函数
function validateLinkUrl(url) {
  // 1. 基本格式验证
  // 2. 协议检查
  // 3. 域名验证
  // 4. 安全性检查
  // 5. 返回验证结果
}

function checkDuplicateUrl(userId, url) {
  // 检查用户是否已有相同或相似URL
}

function sanitizeLinkUrl(url) {
  // URL规范化处理
  // 移除跟踪参数
  // 标准化协议
}
```

### 任务4: 添加链接分析API

**文件**: `linkhub-server/routes/analytics.js` (或新建`links.js`)

**新增端点**:

- `GET /api/links/analytics` - 获取链接点击统计
- `GET /api/links/:linkId/analytics` - 获取单个链接详细统计
- `GET /api/links/performance` - 获取链接性能数据

**功能要求**:

1. **点击统计**
   - 总点击次数
   - 每日点击趋势
   - 设备类型分布
   - 地理位置分布

2. **性能监控**
   - 链接响应时间
   - 链接可用性检查
   - 点击转化率

3. **热门分析**
   - 最受欢迎链接
   - 点击时间段分析
   - 用户行为分析

**数据库扩展**:

```sql
-- 链接点击详细记录表
CREATE TABLE link_clicks (
  id TEXT PRIMARY KEY,
  link_id TEXT REFERENCES links(id) ON DELETE CASCADE,
  user_agent TEXT,
  ip TEXT,
  referrer TEXT,
  created_at DATETIME DEFAULT (datetime('now'))
);

-- 链接性能监控表
CREATE TABLE link_performance (
  id TEXT PRIMARY KEY,
  link_id TEXT REFERENCES links(id) ON DELETE CASCADE,
  response_time INTEGER, -- 毫秒
  status_code INTEGER,
  checked_at DATETIME DEFAULT (datetime('now'))
);
```

### 任务5: 前端API方法更新

**文件**: `linkhub-frontend/src/api.js`

**新增API方法**:

```javascript
// 链接激活/停用
toggleLink:     (id)       => request('PUT',  `/profile/links/${id}/toggle`),
activateLink:   (id)       => request('PUT',  `/profile/links/${id}/activate`),
deactivateLink: (id)       => request('PUT',  `/profile/links/${id}/deactivate`),

// 批量操作
batchUpdateLinks: (updates) => request('PUT',  '/profile/links/batch/update', { updates }),
batchToggleLinks: (ids)     => request('PUT',  '/profile/links/batch/toggle', { ids }),
batchDeleteLinks: (ids)     => request('DELETE', '/profile/links/batch', { ids }),

// 链接分析
getLinkAnalytics: ()        => request('GET',  '/links/analytics'),
getLinkPerformance: (id)    => request('GET',  `/links/${id}/analytics`),
checkLinkHealth: (id)       => request('POST', `/links/${id}/check`),
```

### 任务6: 更新前端LinkList组件

**文件**: `linkhub-frontend/src/components/editor/LinkList.jsx`

**新增功能**:

1. **批量选择操作**
   - 多选链接功能
   - 批量激活/停用
   - 批量删除

2. **链接状态显示**
   - 点击次数显示
   - 链接健康状态指示器
   - 最后点击时间

3. **操作优化**
   - 右键菜单操作
   - 键盘快捷键支持
   - 操作确认对话框

**组件更新**:

```jsx
// 新增props
<LinkList
  // 现有props...
  onBatchToggle={ids => {}} // 批量切换回调
  onBatchDelete={ids => {}} // 批量删除回调
  showAnalytics={true} // 显示分析数据
  enableBatch={true} // 启用批量操作
/>
```

## 🎯 实施要求

### 代码质量要求

1. **错误处理**: 完善的错误响应和用户提示
2. **输入验证**: 所有输入参数严格验证
3. **安全性**: 防止SQL注入和XSS攻击
4. **性能**: 批量操作使用事务，避免N+1查询

### 用户体验要求

1. **响应速度**: API响应时间 < 200ms
2. **操作反馈**: 实时操作状态提示
3. **错误恢复**: 友好的错误提示和恢复建议
4. **移动端适配**: 移动端操作体验良好

### 测试要求

1. **单元测试**: 每个API端点有基本测试
2. **集成测试**: 批量操作和事务测试
3. **性能测试**: 批量操作性能基准
4. **安全测试**: 输入验证和权限测试

## 🔧 实施步骤

### 阶段1: 后端API开发 (2-3小时)

1. 创建链接激活/停用API
2. 创建批量操作API
3. 增强链接验证功能
4. 添加链接分析API

### 阶段2: 前端API集成 (1-2小时)

1. 更新api.js添加新方法
2. 更新LinkList组件支持批量操作
3. 添加链接状态显示和分析视图

### 阶段3: 测试和优化 (1小时)

1. API功能测试
2. 性能测试和优化
3. 移动端体验测试
4. 安全测试

## 📋 验收标准

### 功能验收

- [ ] 链接激活/停用API正常工作
- [ ] 批量操作API支持多种操作
- [ ] 链接验证增强功能有效
- [ ] 链接分析数据准确

### 性能验收

- [ ] 批量操作响应时间 < 500ms (100个链接)
- [ ] 单个API响应时间 < 100ms
- [ ] 内存使用合理
- [ ] 数据库查询优化

### 安全验收

- [ ] 输入验证防止注入攻击
- [ ] 用户权限验证完善
- [ ] 恶意链接检测有效
- [ ] 数据隐私保护

### 用户体验验收

- [ ] 操作反馈及时明确
- [ ] 错误提示友好清晰
- [ ] 移动端操作流畅
- [ ] 批量操作界面直观

## 🚀 技术实现细节

### 批量操作事务处理

```javascript
// 使用SQLite事务确保数据一致性
function batchUpdateLinks(userId, updates) {
  return new Promise((resolve, reject) => {
    db.run('BEGIN TRANSACTION');

    try {
      const results = [];
      for (const update of updates) {
        // 验证每个链接属于用户
        const existing = query('SELECT id FROM links WHERE id = ? AND user_id = ?', [
          update.id,
          userId,
        ]);
        if (existing.length === 0) {
          results.push({ id: update.id, success: false, error: '链接不存在或无权访问' });
          continue;
        }

        // 执行更新
        run(
          "UPDATE links SET label = ?, url = ?, active = ?, updated_at = datetime('now') WHERE id = ?",
          [update.label, update.url, update.active, update.id],
        );

        results.push({ id: update.id, success: true });
      }

      db.run('COMMIT');
      resolve({ success: true, results });
    } catch (error) {
      db.run('ROLLBACK');
      reject(error);
    }
  });
}
```

### 链接验证增强

```javascript
// 使用外部服务进行链接安全检查
async function checkLinkSafety(url) {
  try {
    // 1. 本地规则检查
    if (isMaliciousUrlLocal(url)) {
      return { safe: false, reason: '本地规则匹配恶意链接' };
    }

    // 2. 外部API检查 (可选)
    if (ENABLE_EXTERNAL_SAFETY_CHECK) {
      const safetyResult = await checkWithGoogleSafeBrowsing(url);
      if (!safetyResult.safe) {
        return safetyResult;
      }
    }

    // 3. SSL证书检查 (对https)
    if (url.startsWith('https://')) {
      const sslResult = await checkSSLCertificate(url);
      if (!sslResult.valid) {
        return { safe: false, reason: 'SSL证书无效' };
      }
    }

    return { safe: true };
  } catch (error) {
    // 安全检查失败时，根据安全策略决定
    return SECURITY_STRICT
      ? { safe: false, reason: '安全检查失败' }
      : { safe: true, warning: '安全检查未完成' };
  }
}
```

### 链接分析数据聚合

```javascript
// 高效的链接点击统计查询
function getLinkAnalytics(userId, period = '7d') {
  const dateFilter = getDateFilter(period);

  return {
    // 总点击统计
    totalClicks: query(
      `
      SELECT COUNT(*) as count 
      FROM link_clicks lc
      JOIN links l ON lc.link_id = l.id
      WHERE l.user_id = ? AND lc.created_at >= ?
    `,
      [userId, dateFilter],
    )[0].count,

    // 按链接分组统计
    byLink: query(
      `
      SELECT 
        l.id, l.label, l.url,
        COUNT(lc.id) as click_count,
        MAX(lc.created_at) as last_click
      FROM links l
      LEFT JOIN link_clicks lc ON l.id = lc.link_id AND lc.created_at >= ?
      WHERE l.user_id = ?
      GROUP BY l.id
      ORDER BY click_count DESC
    `,
      [dateFilter, userId],
    ),

    // 按时间分组统计
    byTime: query(
      `
      SELECT 
        DATE(lc.created_at) as date,
        COUNT(*) as click_count
      FROM link_clicks lc
      JOIN links l ON lc.link_id = l.id
      WHERE l.user_id = ? AND lc.created_at >= ?
      GROUP BY DATE(lc.created_at)
      ORDER BY date ASC
    `,
      [userId, dateFilter],
    ),

    // 设备分布
    byDevice: query(
      `
      SELECT 
        CASE 
          WHEN lc.user_agent LIKE '%iPhone%' OR lc.user_agent LIKE '%iPad%' THEN 'iOS'
          WHEN lc.user_agent LIKE '%Android%' THEN 'Android'
          WHEN lc.user_agent LIKE '%Windows%' THEN 'Windows'
          WHEN lc.user_agent LIKE '%Mac%' THEN 'Mac'
          ELSE 'Other'
        END as device,
        COUNT(*) as count
      FROM link_clicks lc
      JOIN links l ON lc.link_id = l.id
      WHERE l.user_id = ? AND lc.created_at >= ?
      GROUP BY device
    `,
      [userId, dateFilter],
    ),
  };
}
```

## 💡 扩展考虑

### 未来功能扩展

1. **链接分组**: 将链接分类到不同组
2. **链接模板**: 预定义常用链接模板
3. **智能排序**: 基于点击率的自动排序
4. **A/B测试**: 测试不同链接标题的效果

### 技术演进

1. **实时分析**: WebSocket实时更新点击数据
2. **机器学习**: 基于用户行为的链接推荐
3. \*\*CDN集成
