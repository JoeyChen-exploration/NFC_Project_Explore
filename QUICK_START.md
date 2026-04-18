# LinkHub NFC项目 - 代码规范快速开始指南

## 🚀 一分钟设置

### 1. 安装依赖

```bash
# 安装根目录依赖
npm install

# 安装前端依赖
cd linkhub-frontend && npm install

# 安装后端依赖
cd linkhub-server && npm install
```

### 2. 配置编辑器 (VS Code推荐)

安装以下扩展：

- ESLint
- Prettier - Code formatter

添加工作区设置：

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "eslint.validate": ["javascript", "javascriptreact"]
}
```

## 📋 常用命令

### 代码检查

```bash
# 检查前端代码
cd linkhub-frontend && npm run lint

# 检查后端代码
cd linkhub-server && npm run lint

# 检查整个项目
npm run lint
```

### 自动修复

```bash
# 修复前端代码
cd linkhub-frontend && npm run lint:fix

# 修复后端代码
cd linkhub-server && npm run lint:fix
```

### 代码格式化

```bash
# 格式化整个项目
npm run format

# 检查格式化
npm run format:check
```

## 🔧 Git工作流程

### 正常提交

```bash
git add .
git commit -m "提交信息"
# 自动触发：ESLint检查 + Prettier格式化
```

### 跳过检查 (紧急情况)

```bash
git commit --no-verify -m "紧急修复: [描述]"
```

## 🎯 代码规范要点

### 必须遵守

1. **单引号**: 使用单引号，不是双引号
2. **分号**: 语句结尾必须加分号
3. **2空格缩进**: 不要使用Tab
4. **尾随逗号**: 多行对象/数组需要尾随逗号

### React规范

1. 使用函数组件，避免class组件
2. 组件文件使用`.jsx`扩展名
3. 工具函数使用`.js`扩展名

### 命名约定

- 变量/函数: `camelCase`
- 组件: `PascalCase`
- 常量: `UPPER_SNAKE_CASE`

## ❓ 遇到问题？

### 常见问题

1. **提交被阻止**: 查看控制台错误，修复后重新提交
2. **自动修复无效**: 运行 `npm run lint:fix` 手动修复
3. **规则冲突**: 优先遵循Prettier格式

### 详细帮助

- 查看 [CODE_STANDARDS.md](./CODE_STANDARDS.md) - 完整规范文档
- 查看 [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - 故障排除指南

## 📞 支持

如果遇到无法解决的问题：

1. 检查错误信息
2. 查看相关文档
3. 联系团队技术负责人

---

**记住**: 保持代码整洁，让工具帮你工作！
