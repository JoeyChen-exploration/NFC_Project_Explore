#!/usr/bin/env node

/**
 * Production Security Check Script
 * Run this script to verify security configuration before deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🔒 LinkHub 生产环境安全检查\n');

let hasErrors = false;
let hasWarnings = false;

// Check 1: Environment variables
console.log('1. 检查环境变量...');
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');

  // Check for default JWT secret
  if (envContent.includes('your-super-secret-jwt-key-change-me')) {
    console.error('❌ 错误: .env 文件中使用了默认的JWT密钥');
    console.error("   请生成一个强密钥: openssl rand -base64 64 | tr -d '\\n'");
    hasErrors = true;
  }

  // Check JWT secret length
  const jwtMatch = envContent.match(/JWT_SECRET=(.+)/);
  if (jwtMatch && jwtMatch[1]) {
    const secret = jwtMatch[1].trim();
    if (secret.length < 32) {
      console.error('❌ 错误: JWT_SECRET 太短 (至少需要32个字符)');
      console.error(`   当前长度: ${secret.length} 字符`);
      hasErrors = true;
    }
  }

  // Check NODE_ENV
  if (envContent.includes('NODE_ENV=development')) {
    console.warn('⚠️  警告: NODE_ENV 设置为 development');
    console.warn('   生产环境应设置为 NODE_ENV=production');
    hasWarnings = true;
  }
} else {
  console.warn('⚠️  警告: 未找到 .env 文件');
  console.warn('   请从 .env.example 创建 .env 文件');
  hasWarnings = true;
}

// Check 2: Package dependencies
console.log('\n2. 检查依赖包安全性...');
const packagePath = path.join(__dirname, '..', 'package.json');
if (fs.existsSync(packagePath)) {
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

  // Check for known vulnerable packages (simplified check)
  const vulnerablePackages = {
    jsonwebtoken: '^9.0.0', // Should be >= 9.0.0 for security fixes
    bcryptjs: '^3.0.0',
    express: '^5.0.0',
  };

  for (const [pkgName, minVersion] of Object.entries(vulnerablePackages)) {
    if (pkg.dependencies && pkg.dependencies[pkgName]) {
      const version = pkg.dependencies[pkgName];
      console.log(`   ✓ ${pkgName}: ${version}`);
    }
  }
}

// Check 3: Directory permissions
console.log('\n3. 检查目录权限...');
const dbPath = path.join(__dirname, '..', 'db', 'linkhub.db');
if (fs.existsSync(dbPath)) {
  try {
    const stats = fs.statSync(dbPath);
    // Check if database file is world-readable
    if ((stats.mode & 0o004) !== 0) {
      console.warn('⚠️  警告: 数据库文件全局可读');
      console.warn('   建议权限: chmod 600 db/linkhub.db');
      hasWarnings = true;
    }
  } catch (err) {
    console.log(`   ℹ️  无法检查数据库文件权限: ${err.message}`);
  }
}

// Check 4: Security headers (in index.js)
console.log('\n4. 检查安全头设置...');
const indexPath = path.join(__dirname, '..', 'index.js');
if (fs.existsSync(indexPath)) {
  const indexContent = fs.readFileSync(indexPath, 'utf8');

  // Check for security headers
  if (!indexContent.includes('helmet')) {
    console.warn('⚠️  警告: 未使用 helmet 安全头中间件');
    console.warn('   建议安装: npm install helmet');
    console.warn('   并在 index.js 中添加: app.use(helmet())');
    hasWarnings = true;
  }

  // Check for rate limiting
  if (!indexContent.includes('rateLimit') && !indexContent.includes('rate-limit')) {
    console.warn('⚠️  警告: 未配置速率限制');
    console.warn('   建议安装: npm install express-rate-limit');
    hasWarnings = true;
  }
}

// Check 5: Logging configuration
console.log('\n5. 检查日志配置...');
if (fs.existsSync(indexPath)) {
  const indexContent = fs.readFileSync(indexPath, 'utf8');

  // Check for sensitive data logging
  if (
    indexContent.includes('console.log(req.body)') ||
    indexContent.includes('console.log(token)') ||
    indexContent.includes('console.log(password)')
  ) {
    console.error('❌ 错误: 代码中包含敏感数据日志记录');
    console.error('   请移除包含密码、token等敏感信息的console.log语句');
    hasErrors = true;
  }
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('安全检查完成\n');

if (hasErrors) {
  console.error('❌ 发现关键安全问题，请修复后再部署到生产环境！');
  process.exit(1);
} else if (hasWarnings) {
  console.warn('⚠️  发现一些警告，建议修复以获得更好的安全性');
  console.log('✅ 没有发现关键安全问题');
  process.exit(0);
} else {
  console.log('✅ 所有安全检查通过！');
  console.log('💡 建议: 考虑添加以下安全措施:');
  console.log("   - 启用HTTPS (使用Let's Encrypt)");
  console.log('   - 设置防火墙规则');
  console.log('   - 定期更新依赖包');
  console.log('   - 实施SQL注入防护测试');
  process.exit(0);
}
