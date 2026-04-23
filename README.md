# LinkHub NFC

黑白简约风格的 NFC 电子名片平台。  
核心目标是让用户在几分钟内完成「创建主页 → 绑定卡片 → 可被手机扫码访问」的完整闭环。

## 项目现状

- 前端：React + Vite（编辑器、公开主页、Dashboard）
- 后端：Node.js + Express + SQLite
- 重点能力：NFC 卡片绑定、扫描重定向、扫描统计、中英文切换、极简视觉系统

## 快速开始（一键启动/停止）

```bash
cd /Users/lobster_lab/.openclaw/workspace/nfc-project/NFC_Project_Explore

# 启动前后端
./start-linkhub.sh
# 或
npm run start:app

# 停止前后端
./stop-linkhub.sh
# 或
npm run stop:app
```

启动后可访问：

- 前端 Dashboard: `http://localhost:5173/dashboard`
- 编辑器：`http://localhost:5173/editor`
- 后端健康检查：`http://localhost:3001/api/health`

## NFC 真实可用流程（本地开发版）

只在 `localhost` 下运行时，别人手机 tap 你的卡片无法访问你的电脑。  
要让实体卡可被外网手机访问，建议用临时隧道。

### 1. 启动本地服务

```bash
./start-linkhub.sh
```

### 2. 启动 Cloudflare Tunnel（免费临时域名）

如果你已经有 `cloudflared`，直接运行：

```bash
cloudflared tunnel --url http://127.0.0.1:5173 --no-autoupdate
```

如果报错 `zsh: command not found: cloudflared`，先用绝对路径启动：

```bash
~/.local/bin/cloudflared tunnel --url http://127.0.0.1:5173 --no-autoupdate
```

再把用户目录加入 PATH（只需做一次）：

```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
cloudflared --version
```

会得到一个类似：

```txt
https://xxxx-xxxx.trycloudflare.com
```

### 3. 用公网域名打开编辑器再生成 NFC 链接

务必用隧道域名打开页面（不是 localhost），再去复制/写入 NFC 链接。  
这样写进卡片的地址才是公网可访问地址。

## Homebrew 权限报错说明（你这次遇到的）

如果你看到这类错误：

```txt
Error: /usr/local/Cellar is not writable
```

原因通常是 `/usr/local` 下 Homebrew 目录不归当前用户所有（常见于历史上使用过 `sudo brew`）。

你有两种策略：

1. 修复 Homebrew 目录权限（系统级变更，谨慎操作）
2. 绕过 brew，直接把 `cloudflared` 安装到用户目录（更安全）

推荐第 2 种，示例：

```bash
mkdir -p ~/.local/bin
cd /tmp
curl -L --fail -o cloudflared.tgz \
  https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-darwin-amd64.tgz
tar -xzf cloudflared.tgz
install -m 755 cloudflared ~/.local/bin/cloudflared
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
cloudflared --version
```

## 常见问题

### 1) 为什么卡片写了链接，手机 tap 还是打不开？

- 你写入的还是 `localhost` 链接
- 或者你开了隧道，但用 localhost 页面生成了链接

解决：

- 用隧道域名打开编辑器页面
- 重新复制并写入 `https://.../nfc/<serial>` 链接

### 2) 为什么隧道地址能打开首页，但某些请求失败？

常见是 Vite host/allowedHosts 配置不匹配。  
本仓库已在 [linkhub-frontend/vite.config.js](/Users/lobster_lab/.openclaw/workspace/nfc-project/NFC_Project_Explore/linkhub-frontend/vite.config.js) 添加：

- `host: true`
- `allowedHosts` 包含 `.trycloudflare.com`

### 3) 为什么公网域名会变化？

`trycloudflare.com` 是临时隧道，每次重启可能变化。  
生产环境请使用你自己的固定域名 + 正式部署。

### 4) 为什么执行 `cloudflared` 提示 command not found？

- 程序已安装在 `~/.local/bin`，但当前终端 PATH 没加载到该目录

解决：

- 临时：`~/.local/bin/cloudflared ...`
- 永久：把 `export PATH="$HOME/.local/bin:$PATH"` 写入 `~/.zshrc` 后 `source ~/.zshrc`

## 环境要求

- Node.js >= 18
- npm >= 9
- macOS / Linux（Windows 建议 WSL）

## 仓库结构

```txt
NFC_Project_Explore/
├── linkhub-frontend/      # React + Vite
├── linkhub-server/        # Express + SQLite
├── start-linkhub.sh       # 一键启动
├── stop-linkhub.sh        # 一键停止
└── .linkhub-runtime/      # 运行日志与 PID
```

## 开发规范（简版）

- 使用功能分支开发，不直接改 `main`
- 提交信息使用清晰前缀：`feat: / fix: / refactor: / docs:`
- PR 需要说明：改动目的、主要变更、验证方式、截图（如涉及 UI）

## 下一步建议

- 把「隧道地址」做成 Dashboard 里的一键生成与展示
- 增加“写卡前检查”，阻止写入 `localhost` 链接
- 生产化部署（固定域名 + HTTPS）后再做批量发卡

## License

ISC
