# 极致克制图标生成任务

## 🎯 目标

为极致克制设计系统生成黑白灰风格的图标和视觉元素。

## 🖤 设计原则

### 1. 颜色系统

- **主色**: 黑白灰 (100%)
- **无彩色**: 禁止使用任何彩色
- **灰度层次**: 使用精致的灰阶系统
- **对比度**: 高对比度，确保可读性

### 2. 风格系统

- **线性图标**: 无填充，只有轮廓
- **简约细节**: 删除一切不必要的细节
- **几何形状**: 基于基本几何形状
- **一致笔画**: 统一的笔画宽度

### 3. 尺寸系统

- **大图标**: 64×64px (Bento网格)
- **中图标**: 32×32px (导航栏)
- **小图标**: 16×16px (按钮内)
- **超大图标**: 128×128px (个人头像)

## 🎨 需要生成的图标清单

### A. Bento网格图标 (9个)

每个图标: 64×64px，黑白线性风格

1. **链接管理** (Links)
   - 主题: 链条或连接点
   - 风格: 极简线性
   - 描述: 表示链接管理和组织

2. **主题设置** (Theme)
   - 主题: 调色板或画笔
   - 风格: 几何简约
   - 描述: 表示主题和外观定制

3. **社交连接** (Social)
   - 主题: 网络节点或分享箭头
   - 风格: 连接点线性
   - 描述: 表示社交媒体连接

4. **个人资料** (Profile)
   - 主题: 用户轮廓或头像
   - 风格: 简约人形
   - 描述: 表示个人资料管理

5. **实时预览** (Preview)
   - 主题: 眼睛或屏幕
   - 风格: 简约几何
   - 描述: 表示实时预览功能

6. **NFC功能** (NFC)
   - 主题: 无线波或卡片
   - 风格: 科技线性
   - 描述: 表示NFC电子名片

7. **系统设置** (Settings)
   - 主题: 齿轮或滑块
   - 风格: 机械简约
   - 描述: 表示系统设置

8. **数据分析** (Analytics)
   - 主题: 图表或增长箭头
   - 风格: 数据可视化
   - 描述: 表示数据统计分析

9. **导出分享** (Export)
   - 主题: 上传箭头或分享符号
   - 风格: 动作线性
   - 描述: 表示导出和分享功能

### B. 导航图标 (5个)

每个图标: 32×32px，黑白线性风格

1. **首页** (Home)
2. **编辑器** (Editor)
3. **分析** (Analytics)
4. **设置** (Settings)
5. **帮助** (Help)

### C. 按钮状态图标 (4个)

每个图标: 16×16px，黑白线性风格

1. **添加** (Plus)
2. **编辑** (Pencil)
3. **删除** (Trash)
4. **保存** (Check)

### D. 品牌元素 (3个)

1. **Logo变体** - 黑白简约版本
2. **背景纹理** - 微妙噪声纹理
3. **分隔线** - 精致分隔元素

## 🚀 生成策略

### 使用nano-banana-pro技能

基于推理驱动的图像生成：

**提示公式**:

```
[REASONING_BRIEF]
SUBJECT: A highly detailed [图标主题].
ACTION: The icon is [动作描述].
ENVIRONMENT: Situated on a pure white background.
LIGHTING: Illuminated by natural lighting with subtle shadows.
STYLE: Use a minimalist linear icon aesthetic. Black and white only, no colors. Clean lines, geometric precision.
EXTRA: Icon should be [尺寸] pixels, with consistent stroke width.
[EXECUTE] Generate a photorealistic icon based on this logic.
```

### 具体生成示例

**示例1: 链接管理图标**

```bash
bash generate-nano-art.sh \
  --subject "minimalist chain link icon" \
  --action "representing connection and organization" \
  --context "on pure white background" \
  --style "linear icon, black and white only" \
  --lighting "natural light with subtle drop shadow" \
  --resolution "1k"
```

**示例2: 主题设置图标**

```bash
bash generate-nano-art.sh \
  --subject "geometric color palette icon" \
  --action "representing theme customization" \
  --context "on pure white background" \
  --style "minimalist linear design, monochrome" \
  --lighting "flat lighting, no gradients" \
  --resolution "1k"
```

## 📁 文件组织

### 图标目录结构

```
src/assets/icons/
├── bento/           # Bento网格图标 (64×64)
│   ├── links.svg
│   ├── theme.svg
│   ├── social.svg
│   └── ...
├── navigation/      # 导航图标 (32×32)
│   ├── home.svg
│   ├── editor.svg
│   └── ...
├── buttons/         # 按钮图标 (16×16)
│   ├── plus.svg
│   ├── pencil.svg
│   └── ...
└── brand/           # 品牌元素
    ├── logo-minimal.svg
    ├── texture-noise.svg
    └── ...
```

### 命名规范

- 小写字母，使用连字符
- 描述性名称
- 包含尺寸信息
- 示例: `links-64.svg`, `home-32.svg`, `plus-16.svg`

## 🛠️ 技术实施

### 1. 图标格式

- **首选**: SVG (矢量，可缩放)
- **备选**: PNG (栅格，确保高分辨率)
- **颜色**: 纯黑色 (#000000) 或深灰色

### 2. 优化要求

- 删除元数据
- 简化路径
- 统一笔画宽度
- 确保可访问性

### 3. 集成方式

```jsx
// React组件中使用
import LinksIcon from '../assets/icons/bento/links.svg';

function BentoGrid() {
  return (
    <div className="bento-cell">
      <img src={LinksIcon} alt="Links" />
      <span>Links</span>
    </div>
  );
}
```

## 📋 验收标准

### 视觉标准

- [ ] 100% 黑白灰，无彩色
- [ ] 线性风格，无填充
- [ ] 一致的笔画宽度
- [ ] 几何精确对齐
- [ ] 简约细节，无冗余

### 技术标准

- [ ] SVG格式，优化路径
- [ ] 正确尺寸 (64×64, 32×32, 16×16)
- [ ] 纯黑色或深灰色
- [ ] 透明背景
- [ ] 可访问性标签

### 一致性标准

- [ ] 所有图标统一风格
- [ ] 相同的视觉重量
- [ ] 一致的圆角半径
- [ ] 统一的细节层次

## 🚀 执行计划

### 阶段1: 生成Bento网格图标 (优先级最高)

1. 创建图标目录结构
2. 生成9个Bento网格图标
3. 优化SVG文件
4. 测试在界面中的显示

### 阶段2: 生成导航和按钮图标

1. 生成导航图标 (5个)
2. 生成按钮状态图标 (4个)
3. 创建图标组件库
4. 集成到现有组件

### 阶段3: 生成品牌元素

1. 创建Logo变体
2. 生成背景纹理
3. 制作分隔线元素
4. 更新品牌视觉系统

## 💡 设计参考

### Apple图标系统

- 线性图标，简约细节
- 一致的视觉重量
- 几何精确性
- 高对比度

### Bento.me图标

- 功能性明确
- 简约表达
- 网格友好
- 快速识别

### 黑白摄影美学

- 光影层次
- 质感细节
- 对比度控制
- 简约构图

---

**开始时间**: 立即
**原则**: 极致克制，黑白灰主调
**目标**: 创建完整的极致克制图标系统
