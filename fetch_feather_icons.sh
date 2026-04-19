#!/bin/bash
# 从Feather Icons获取极致克制图标

# 创建目录
mkdir -p feather-icons
cd feather-icons

# 我们需要的主要图标
icons=(
    "link"      # 链接管理
    "palette"   # 主题设置
    "users"     # 社交/用户
    "user"      # 个人资料
    "eye"       # 预览
    "radio"     # NFC/无线
    "settings"  # 设置
    "bar-chart" # 分析
    "upload"    # 导出
    "plus"      # 添加
    "edit"      # 编辑
    "trash"     # 删除
    "check"     # 确认
    "home"      # 首页
    "help-circle" # 帮助
)

echo "🎨 从Feather Icons下载极致克制图标..."

for icon in "${icons[@]}"; do
    echo "📥 下载: $icon.svg"
    curl -s "https://raw.githubusercontent.com/feathericons/feather/master/icons/$icon.svg" -o "$icon.svg"
    
    # 转换为64x64尺寸并调整颜色为黑色
    if [ -f "$icon.svg" ]; then
        # 替换颜色为黑色，调整尺寸
        sed -i '' 's/stroke="currentColor"/stroke="#000000"/g' "$icon.svg"
        sed -i '' 's/width="24"/width="64"/g' "$icon.svg"
        sed -i '' 's/height="24"/height="64"/g' "$icon.svg"
        echo "  ✅ 已调整: 64x64, 黑色"
    else
        echo "  ❌ 下载失败"
    fi
done

echo ""
echo "📊 下载完成统计:"
ls -la *.svg | wc -l | xargs echo "✅ 总共下载: "
echo ""
echo "📁 图标保存在: $(pwd)"
echo ""
echo "🎯 这些图标符合极致克制美学:"
echo "   • 黑白线性风格"
echo "   • 几何简约"
echo "   • 64x64标准尺寸"
echo "   • 开源免费使用"