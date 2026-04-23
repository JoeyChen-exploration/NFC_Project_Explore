#!/bin/bash

# 测试优化版Dashboard
echo "🚀 启动优化版LinkHub测试..."

# 进入项目目录
cd /Users/lobster_lab/.openclaw/workspace/nfc-project/NFC_Project_Explore

# 检查依赖
echo "📦 检查依赖..."
if [ ! -d "linkhub-frontend/node_modules" ]; then
    echo "安装前端依赖..."
    cd linkhub-frontend
    npm install
    cd ..
fi

if [ ! -d "linkhub-server/node_modules" ]; then
    echo "安装后端依赖..."
    cd linkhub-server
    npm install
    cd ..
fi

# 清理端口
echo "🧹 清理端口..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

# 启动后端
echo "🔧 启动后端服务器..."
cd linkhub-server
npm start &
BACKEND_PID=$!
cd ..

# 等待后端启动
echo "⏳ 等待后端启动..."
sleep 5

# 检查后端健康
echo "🩺 检查后端健康..."
curl -s http://localhost:3001/api/health || {
    echo "❌ 后端启动失败"
    kill $BACKEND_PID 2>/dev/null
    exit 1
}

# 启动前端
echo "🎨 启动前端开发服务器..."
cd linkhub-frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# 等待前端启动
echo "⏳ 等待前端启动..."
sleep 8

# 显示优化特性
echo ""
echo "=========================================="
echo "✅ 优化版Dashboard已启动！"
echo ""
echo "🎯 已实施的优化特性："
echo ""
echo "🎨 视觉优化："
echo "  ✅ 完整设计系统（颜色、字体、间距、阴影）"
echo "  ✅ 暗色模式支持"
echo "  ✅ 微动画系统（悬停、点击、加载）"
echo "  ✅ 响应式布局（移动端优先）"
echo ""
echo "🖱️ 交互优化："
echo "  ✅ 骨架屏加载"
echo "  ✅ 实时表单验证"
echo "  ✅ 通知系统"
echo "  ✅ 批量操作支持"
echo ""
echo "⚡ 性能优化："
echo "  ✅ 虚拟滚动（大量数据）"
echo "  ✅ 图片懒加载"
echo "  ✅ 防抖节流"
echo "  ✅ 代码分割和懒加载"
echo ""
echo "📱 移动端优化："
echo "  ✅ 触摸目标≥44px"
echo "  ✅ 滑动删除"
echo "  ✅ 下拉刷新"
echo "  ✅ 长按操作"
echo "  ✅ 手势检测"
echo ""
echo "♿ 可访问性优化："
echo "  ✅ WCAG 2.1 AA标准"
echo "  ✅ 完整键盘导航"
echo "  ✅ 屏幕阅读器支持"
echo "  ✅ 高对比度模式"
echo "  ✅ 减少动画选项"
echo "  ✅ 字体大小调整"
echo ""
echo "🔧 功能优化："
echo "  ✅ NFC卡片管理（CRUD）"
echo "  ✅ 批量操作"
echo "  ✅ 搜索过滤"
echo "  ✅ 数据统计"
echo "  ✅ 分享功能"
echo ""
echo "=========================================="
echo ""
echo "🌐 访问地址："
echo "1. 📱 优化Dashboard：http://localhost:5173/dashboard"
echo "2. 🔗 完整编辑器：http://localhost:5173/editor"
echo "3. 📊 分析页面：http://localhost:5173/analytics"
echo "4. 🚀 技术展示：http://localhost:5173/showcase"
echo ""
echo "📊 后端API：http://localhost:3001"
echo "🩺 健康检查：http://localhost:3001/api/health"
echo ""
echo "🔍 测试建议："
echo "1. 在Dashboard创建NFC卡片"
echo "2. 测试移动端响应式"
echo "3. 使用键盘导航（Tab键）"
echo "4. 测试批量操作"
echo "5. 检查加载性能"
echo ""
echo "📝 按 Ctrl+C 停止所有服务"
echo "=========================================="

# 显示Git提交历史
echo ""
echo "📚 本次优化提交历史："
git log --oneline -10

# 等待用户中断
trap "echo '停止服务...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo '服务已停止'; exit" INT
wait