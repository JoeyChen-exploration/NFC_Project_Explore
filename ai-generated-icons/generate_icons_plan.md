# AI图标生成计划 (20次机会)

## 🎯 生成策略

**原则：物尽其用，极致克制，黑白灰美学**

### 分辨率选择：1K (1024px)

- 免费版可能有限制
- 1K足够图标使用
- 节省token/配额

### 风格要求：

- **黑白灰主调**：禁止使用任何彩色
- **线性图标**：无填充，只有轮廓
- **简约细节**：删除一切不必要的细节
- **几何形状**：基于基本几何形状
- **一致笔画**：统一的笔画宽度

## 📋 生成清单 (按优先级)

### 第一优先级：Bento网格图标 (9个)

**每个图标：64×64px，黑白线性风格**

1. **links** - 链接管理图标
   - 主题：链条或连接点
   - 提示："minimalist chain link icon, black and white only, linear style, geometric precision, 64x64 pixels, no colors, no gradients, clean lines"

2. **theme** - 主题设置图标
   - 主题：调色板或画笔
   - 提示："minimalist color palette icon, black and white only, linear style, geometric shapes, 64x64 pixels, no colors, no gradients, clean lines"

3. **social** - 社交连接图标
   - 主题：网络节点或分享箭头
   - 提示："minimalist network nodes icon, black and white only, linear style, connection points, 64x64 pixels, no colors, no gradients, clean lines"

4. **profile** - 个人资料图标
   - 主题：用户轮廓或头像
   - 提示："minimalist user profile icon, black and white only, linear style, geometric silhouette, 64x64 pixels, no colors, no gradients, clean lines"

5. **preview** - 实时预览图标
   - 主题：眼睛或屏幕
   - 提示："minimalist eye or screen icon, black and white only, linear style, geometric shapes, 64x64 pixels, no colors, no gradients, clean lines"

6. **nfc** - NFC功能图标
   - 主题：无线波或卡片
   - 提示："minimalist NFC or wireless icon, black and white only, linear style, radio waves, 64x64 pixels, no colors, no gradients, clean lines"

7. **settings** - 系统设置图标
   - 主题：齿轮或滑块
   - 提示："minimalist gear or settings icon, black and white only, linear style, mechanical precision, 64x64 pixels, no colors, no gradients, clean lines"

8. **analytics** - 数据分析图标
   - 主题：图表或增长箭头
   - 提示："minimalist chart or analytics icon, black and white only, linear style, data visualization, 64x64 pixels, no colors, no gradients, clean lines"

9. **export** - 导出分享图标
   - 主题：上传箭头或分享符号
   - 提示："minimalist upload or share icon, black and white only, linear style, arrow symbol, 64x64 pixels, no colors, no gradients, clean lines"

### 第二优先级：品牌视觉元素 (4个)

10. **logo-minimal** - Logo极致克制变体
    - 尺寸：256×256px
    - 提示："minimalist 'LH' monogram logo, black and white only, geometric letters, negative space, 256x256 pixels, no colors, elegant typography"

11. **texture-noise** - 背景噪声纹理
    - 尺寸：512×512px
    - 提示："subtle black and white noise texture, minimalist, geometric pattern, low contrast, 512x512 pixels, seamless tile, background texture"

12. **divider-line** - 精致分隔线元素
    - 尺寸：1024×16px
    - 提示："minimalist divider line, black and white only, geometric pattern, thin line, 1024x16 pixels, decorative separator"

13. **loading-animation** - 极简加载动画帧
    - 尺寸：64×64px
    - 提示："minimalist loading animation frame, black and white only, geometric dots, circular motion, 64x64 pixels, 3 dots"

### 第三优先级：按钮状态图标 (4个)

14. **plus** - 添加按钮图标
    - 尺寸：32×32px
    - 提示："minimalist plus icon, black and white only, linear style, geometric cross, 32x32 pixels, no colors, clean lines"

15. **pencil** - 编辑按钮图标
    - 尺寸：32×32px
    - 提示："minimalist pencil icon, black and white only, linear style, geometric shape, 32x32 pixels, no colors, clean lines"

16. **trash** - 删除按钮图标
    - 尺寸：32×32px
    - 提示："minimalist trash can icon, black and white only, linear style, geometric shape, 32x32 pixels, no colors, clean lines"

17. **check** - 保存按钮图标
    - 尺寸：32×32px
    - 提示："minimalist checkmark icon, black and white only, linear style, geometric tick, 32x32 pixels, no colors, clean lines"

### 第四优先级：备用/优化 (3个)

18. **links-optimized** - 链接图标优化版
    - 如果第一个links图标不满意
    - 提示："improved minimalist chain link icon, black and white only, more geometric, better proportions, 64x64 pixels"

19. **texture-optimized** - 纹理优化版
    - 如果噪声纹理不够精致
    - 提示："improved subtle noise texture, black and white only, more uniform, better contrast, 512x512 pixels"

20. **logo-final** - Logo最终优化版
    - 确保品牌元素完美
    - 提示："final minimalist 'LinkHub' logo, black and white only, perfect geometry, elegant typography, 256x256 pixels"

## 🚀 生成命令模板

```bash
# 设置API密钥
export GEMINI_API_KEY="AIzaSyABf99_-KxcQcwjxUGzd9vPwkFmBR6aJ04"

# 生成命令模板
python3 /Users/lobster_lab/.openclaw/workspace/skills/nano-banana-pro/scripts/generate_image.py \
  --prompt "PROMPT_HERE" \
  --filename "icon-name.png" \
  --resolution "1K" \
  --api-key "$GEMINI_API_KEY"
```

## 📁 文件命名规范

### 命名模式：

`{序号}-{名称}-{尺寸}.png`

### 示例：

- `01-links-64.png`
- `02-theme-64.png`
- `10-logo-minimal-256.png`
- `14-plus-32.png`

## 🔧 后期处理计划

### 1. 转换为SVG (优先)

- 使用工具将PNG转换为SVG
- 优化路径，减少节点
- 确保纯黑色 (#000000)

### 2. 尺寸标准化

- Bento图标：64×64px
- 按钮图标：32×32px
- Logo：256×256px
- 纹理：512×512px

### 3. 颜色标准化

- 转换为纯黑白
- 去除灰度，只保留黑白
- 确保高对比度

### 4. 集成到项目

- 复制到 `src/assets/icons/` 对应目录
- 更新 `MinimalIcon.jsx` 组件
- 测试显示效果

## ⚠️ 注意事项

### 免费版限制：

1. **次数限制**：严格20次，不能浪费
2. **分辨率限制**：可能只支持1K
3. **内容限制**：避免复杂场景，专注简单图标
4. **风格限制**：必须保持黑白灰极致克制

### 质量保证：

1. **先生成测试图标**：先试1-2个看效果
2. **调整提示词**：根据效果优化后续提示
3. **备用机会**：保留3次机会用于优化
4. **批量处理**：相似图标一起生成，保持一致性

### 错误处理：

1. **API错误**：检查密钥，等待重试
2. **质量不佳**：使用备用机会重新生成
3. **风格不一致**：调整提示词强调"minimalist, black and white only"
4. **尺寸错误**：后期裁剪调整

## 🎯 成功标准

### 视觉标准：

- [ ] 100% 黑白灰，无彩色
- [ ] 线性风格，无填充
- [ ] 一致的笔画宽度
- [ ] 几何精确对齐
- [ ] 简约细节，无冗余

### 技术标准：

- [ ] 正确尺寸 (64×64, 32×32等)
- [ ] 纯黑色或深灰色
- [ ] 透明背景
- [ ] 可访问性标签

### 一致性标准：

- [ ] 所有图标统一风格
- [ ] 相同的视觉重量
- [ ] 一致的圆角半径
- [ ] 统一的细节层次

## 🚀 开始执行

**执行顺序：**

1. 先生成前2个图标测试效果
2. 根据效果调整后续提示词
3. 批量生成Bento网格图标
4. 生成品牌元素
5. 生成按钮图标
6. 使用备用机会优化

**目标：** 用20次机会创建完整的极致克制图标系统！
