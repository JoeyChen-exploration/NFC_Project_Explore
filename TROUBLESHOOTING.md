# 代码规范工具链故障排除

## 常见问题及解决方案

### 1. ESLint找不到模块或配置

**问题**: `Cannot find module 'eslint-plugin-react'` 或类似错误

**解决方案**:

```bash
# 确保在正确的目录安装依赖
cd linkhub-frontend && npm install
cd linkhub-server && npm install
```

### 2. Prettier与ESLint规则冲突

**问题**: ESLint报告格式错误，但Prettier格式化后仍然有问题

**解决方案**:

1. 确保安装了正确的集成包:

```bash
npm install --save-dev eslint-config-prettier eslint-plugin-prettier
```

2. 检查ESLint配置中是否包含:

```javascript
extends: ['plugin:prettier/recommended']
```

3. 运行以下命令检查配置:

```bash
npx eslint --print-config .eslintrc.js | grep prettier
```

### 3. Husky钩子不执行

**问题**: Git提交时没有触发pre-commit钩子

**解决方案**:

1. 检查husky是否已初始化:

```bash
ls -la .husky/
```

2. 重新初始化husky:

```bash
npx husky init
npm run prepare
```

3. 确保pre-commit文件可执行:

```bash
chmod +x .husky/pre-commit
```

4. 检查Git版本(需要>=2.9):

```bash
git --version
```

### 4. Lint-staged只检查部分文件

**问题**: lint-staged没有检查所有暂存文件

**解决方案**:

1. 检查lint-staged配置模式是否正确:

```json
{
  "lint-staged": {
    "linkhub-frontend/src/**/*.{js,jsx}": ["命令"],
    "linkhub-server/**/*.js": ["命令"]
  }
}
```

2. 使用调试模式查看哪些文件被匹配:

```bash
npx lint-staged --debug
```

### 5. 自动修复后提交仍然失败

**问题**: ESLint自动修复后，重新提交仍然失败

**解决方案**:

1. 手动运行修复命令:

```bash
cd linkhub-frontend && npm run lint:fix
cd linkhub-server && npm run lint:fix
```

2. 检查是否有无法自动修复的错误:

```bash
npm run lint
```

3. 手动修复这些错误后重新提交

### 6. 性能问题

**问题**: Git提交或lint命令执行缓慢

**解决方案**:

1. 限制lint-staged检查范围:

```json
{
  "lint-staged": {
    "src/**/*.{js,jsx}": ["eslint --fix --max-warnings 0"]
  }
}
```

2. 添加`.eslintignore`文件忽略不需要检查的目录:

```
node_modules/
dist/
build/
coverage/
```

3. 使用缓存:

```bash
# 在lint-staged命令中添加--cache
"eslint --fix --cache --max-warnings 0"
```

### 7. 不同编辑器/IDE行为不一致

**问题**: VS Code、WebStorm等编辑器格式化结果不同

**解决方案**:

1. 确保编辑器使用项目配置:
   - VS Code: 设置 `"prettier.requireConfig": true`
   - 禁用编辑器的内置格式化工具

2. 在项目根目录创建编辑器配置文件:
   - `.vscode/settings.json`
   - `.idea/codeStyleSettings.xml`

3. 使用命令行工具确保一致性:

```bash
npm run format:check
```

### 8. TypeScript支持

**问题**: 项目添加TypeScript后lint不工作

**解决方案**:

1. 安装TypeScript相关包:

```bash
npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

2. 更新ESLint配置:

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  plugins: ['@typescript-eslint'],
};
```

3. 更新lint-staged配置:

```json
{
  "**/*.{ts,tsx}": ["eslint --fix", "prettier --write"]
}
```

### 9. 团队协作问题

**问题**: 团队成员配置不同导致代码风格不一致

**解决方案**:

1. 将配置文件加入版本控制:
   - `.eslintrc.js`
   - `.prettierrc`
   - `.prettierignore`
   - `.husky/`

2. 在README中明确开发环境要求:
   - Node.js版本
   - npm版本
   - 推荐编辑器扩展

3. 使用CI/CD流水线确保代码质量:

```yaml
# GitHub Actions示例
name: Code Quality
on: [push, pull_request]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm run lint
      - run: npm run format:check
```

### 10. 紧急情况处理

**跳过所有检查**:

```bash
git commit --no-verify -m "紧急修复: [描述]"
```

**临时禁用特定规则**:

```javascript
// eslint-disable-next-line rule-name
const example = '临时禁用';
```

**完全禁用文件检查**:

```javascript
/* eslint-disable */
// 整个文件不检查
```

## 调试技巧

### 1. 查看ESLint实际配置

```bash
npx eslint --print-config path/to/file.js
```

### 2. 查看哪些规则被触发

```bash
npx eslint --debug path/to/file.js
```

### 3. 测试Prettier格式化

```bash
npx prettier --check .
npx prettier --write .
```

### 4. 测试单个文件

```bash
npx eslint path/to/file.js --fix
npx prettier path/to/file.js --write
```

## 联系支持

如果以上解决方案无法解决问题:

1. 检查项目GitHub Issues
2. 查看ESLint、Prettier、husky官方文档
3. 联系团队技术负责人

**重要**: 不要删除或禁用代码质量工具，这会影响项目的长期可维护性。
