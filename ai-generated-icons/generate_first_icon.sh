#!/bin/bash
# 生成第一个测试图标

# 设置API密钥
export GEMINI_API_KEY="AIzaSyABf99_-KxcQcwjxUGzd9vPwkFmBR6aJ04"

# 进入技能目录
cd /Users/lobster_lab/.openclaw/workspace/skills/nano-banana-pro

# 生成第一个图标 - 链接管理图标
echo "🎨 生成第一个图标：链接管理图标"
python3 scripts/generate_image.py \
  --prompt "minimalist chain link icon, black and white only, linear style, geometric precision, 64x64 pixels, no colors, no gradients, clean lines, transparent background" \
  --filename "/Users/lobster_lab/.openclaw/workspace/nfc-project/NFC_Project_Explore/ai-generated-icons/01-test-links-64.png" \
  --resolution "1K" \
  --api-key "$GEMINI_API_KEY"

# 检查是否成功
if [ -f "/Users/lobster_lab/.openclaw/workspace/nfc-project/NFC_Project_Explore/ai-generated-icons/01-test-links-64.png" ]; then
    echo "✅ 图标生成成功！"
    echo "文件位置：/Users/lobster_lab/.openclaw/workspace/nfc-project/NFC_Project_Explore/ai-generated-icons/01-test-links-64.png"
else
    echo "❌ 图标生成失败"
fi