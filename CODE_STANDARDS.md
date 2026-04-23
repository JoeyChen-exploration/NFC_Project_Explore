# LinkHub NFC项目代码规范

## 概述

本文档描述了LinkHub NFC项目的代码规范和开发工作流程。项目已配置完整的代码质量工具链，包括ESLint、Prettier和Git Hooks。

## 工具链配置

### 1. ESLint

- **前端**: 配置了React、React Hooks、React Refresh相关规则
- **后端**: 配置了Node.js最佳实践规则
- **规则集**: 基于ESLint推荐规则，集成了Prettier

### 2. Prettier

- **配置文件**: `.prettierrc` (项目根目录)
- **格式化规则**: 单引号、2空格缩进、尾随逗号等
- **集成**: 与ESLint完全兼容

### 3. Git Hooks

- **工具**: husky + lint-staged
- **钩子**: pre-commit (提交前自动检查和格式化)
- **范围**: 仅对暂存文件进行检查

## 开发工作流程

### 安装依赖

```bash
# 安装根目录依赖
npm install

# 安装前端依赖
cd linkhub-frontend && npm install

# 安装后端依赖
cd linkhub-server && npm install
```

### 常用命令

#### 代码检查

```bash
# 检查前端代码
cd linkhub-frontend && npm run lint

# 检查后端代码
cd linkhub-server && npm run lint

# 检查整个项目
npm run lint
```

#### 代码修复

```bash
# 自动修复前端代码问题
cd linkhub-frontend && npm run lint:fix

# 自动修复后端代码问题
cd linkhub-server && npm run lint:fix
```

#### 代码格式化

```bash
# 格式化前端代码
cd linkhub-frontend && npm run format

# 格式化后端代码
cd linkhub-server && npm run format

# 格式化整个项目
npm run format
```

#### 检查格式化

```bash
# 检查前端代码格式化
cd linkhub-frontend && npm run format:check

# 检查后端代码格式化
cd linkhub-server && npm run format:check

# 检查整个项目格式化
npm run format:check
```

### Git提交流程

1. 添加文件到暂存区: `git add .`
2. 提交更改: `git commit -m "commit message"`
3. 提交时会自动触发:
   - ESLint检查JavaScript/JSX文件
   - Prettier格式化代码
   - 如果有错误，提交会被阻止
   - 自动修复的问题会重新添加到暂存区

## 代码规范细则

### 命名约定

- **变量/函数**: camelCase
- **组件**: PascalCase
- **常量**: UPPER_SNAKE_CASE
- **文件**: kebab-case (React组件使用PascalCase)

### 代码风格

- 使用单引号
- 2空格缩进
- 行尾分号
- 尾随逗号
- 最大行宽: 100字符

### React规范

- 使用函数组件和Hooks
- 避免使用class组件
- 组件文件扩展名: `.jsx`
- 工具函数文件扩展名: `.js`

### 最佳实践

- 避免console.log (生产代码)
- 使用const/let代替var
- 及时处理未使用的变量
- 添加必要的错误处理

## IDE配置

### VS Code推荐配置

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "eslint.validate": ["javascript", "javascriptreact", "typescript", "typescriptreact"],
  "prettier.requireConfig": true
}
```

### 扩展推荐

- ESLint
- Prettier - Code formatter

## 常见问题

### 1. 提交被阻止

如果提交被阻止，查看控制台输出，修复指出的问题后重新提交。

### 2. 自动修复后需要重新add

lint-staged自动修复的文件需要重新添加到暂存区：

```bash
git add .
```

### 3. 跳过Git Hooks

紧急情况下可以跳过钩子：

```bash
git commit --no-verify -m "紧急修复"
```

### 4. 规则冲突

如果ESLint和Prettier规则冲突，优先遵循Prettier格式，ESLint会通过`eslint-config-prettier`禁用冲突规则。

## 维护

### 更新规则

1. 修改`.eslintrc.js`或`.prettierrc`
2. 测试新规则: `npm run lint` 和 `npm run format:check`
3. 提交更改

### 添加新文件类型

如果需要支持新文件类型（如TypeScript），更新：

1. ESLint配置
2. Prettier配置
3. lint-staged配置
4. package.json脚本

---

**最后更新**: 2024-04-18
**维护者**: 开发团队
