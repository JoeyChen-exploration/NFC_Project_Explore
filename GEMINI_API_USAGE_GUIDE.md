# Gemini API密钥使用指南

## 🔑 你的API密钥

```
AIzaSyABf99_-KxcQcwjxUGzd9vPwkFmBR6aJ04
```

**重要提示**：这是你的个人API密钥，请妥善保管，不要分享给他人。

## 🎯 密钥信息

- **类型**：Google Gemini API密钥
- **模型**：Gemini 3 Pro Image (Nano Banana Pro)
- **限制**：免费版，约20次生成机会
- **用途**：图像生成和编辑

## 🚀 如何使用API密钥

### 方法1：在本地Python环境使用

#### 1. 安装必要依赖

```bash
pip install google-generativeai pillow
```

#### 2. 创建Python脚本

```python
import google.generativeai as genai
import os

# 设置API密钥
os.environ['GEMINI_API_KEY'] = 'AIzaSyABf99_-KxcQcwjxUGzd9vPwkFmBR6aJ04'

# 配置API
genai.configure(api_key=os.environ['GEMINI_API_KEY'])

# 创建模型
model = genai.GenerativeModel('gemini-3.0-pro-image-exp')

# 生成图像
response = model.generate_content(
    "minimalist black and white icon of a chain link, linear style, 64x64 pixels"
)

# 保存图像
for part in response.candidates[0].content.parts:
    if hasattr(part, 'inline_data'):
        with open('icon.png', 'wb') as f:
            f.write(part.inline_data.data)
        print("✅ 图像已保存为 icon.png")
```

### 方法2：使用curl命令测试

```bash
# 测试API密钥是否有效
curl -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.0-pro-image-exp:generateContent?key=AIzaSyABf99_-KxcQcwjxUGzd9vPwkFmBR6aJ04" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [{
        "text": "simple black and white icon"
      }]
    }]
  }'
```

### 方法3：使用在线工具

1. 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 使用你的Google账号登录
3. 在API密钥部分输入你的密钥
4. 使用Web界面生成图像

## 🎨 极致克制图像生成提示词

### 图标生成提示词模板

```
minimalist [主题] icon, black and white only, linear style, geometric precision, [尺寸] pixels, no colors, no gradients, clean lines, transparent background
```

### 具体示例

1. **链接图标**：

   ```
   minimalist chain link icon, black and white only, linear style, geometric precision, 64x64 pixels
   ```

2. **Logo变体**：

   ```
   minimalist geometric "LH" monogram logo, black and white only, negative space, 256x256 pixels
   ```

3. **背景纹理**：

   ```
   subtle black and white noise texture, minimalist, geometric pattern, low contrast, 512x512 pixels, seamless tile
   ```

4. **加载动画**：
   ```
   minimalist loading animation frame, black and white only, 3 geometric dots, circular motion, 64x64 pixels
   ```

## 📋 20次机会的最佳使用计划

### 第一优先级 (6次)

1. **Logo极致克制变体** - 品牌核心
2. **背景噪声纹理** - 提升整体质感
3. **复杂图标优化** (NFC图标) - 技术性图标
4. **加载动画帧** - 用户体验
5. **备用优化1** - 质量保证
6. **备用优化2** - 最终调整

### 第二优先级 (如果还有剩余)

7-10. **其他Bento图标优化**
11-14. **按钮状态图标**
15-18. **更多纹理变体**
19-20. **实验性生成**

## 🔧 故障排除

### 常见问题

1. **API密钥无效**：
   - 检查密钥是否正确复制
   - 确保没有多余空格
   - 尝试在Google AI Studio验证

2. **配额限制**：
   - 免费版可能有每日/每月限制
   - 如果达到限制，等待24小时或升级账户

3. **网络问题**：
   - 检查网络连接
   - 尝试使用VPN（某些地区可能受限）

4. **模型不可用**：
   - 确认模型名称正确：`gemini-3.0-pro-image-exp`
   - 检查Google AI更新公告

### 错误代码

- `403`：权限问题，API密钥无效
- `429`：请求过多，达到配额限制
- `500`：服务器错误，稍后重试

## 💡 最佳实践

### 1. 先测试再正式生成

```python
# 先测试小尺寸
test_prompt = "simple black dot, 32x32 pixels"
# 确认效果后再生成正式图标
```

### 2. 使用结构化提示词

```python
prompt = """
Create a minimalist icon with these specifications:
- Subject: Chain link representing connection
- Style: Black and white only, linear
- Size: 64x64 pixels
- Requirements: No colors, no gradients, geometric precision
"""
```

### 3. 保存生成结果

```python
import datetime

# 使用时间戳命名
timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
filename = f"icon_{timestamp}.png"
```

### 4. 记录使用情况

```python
usage_log = []
usage_log.append({
    "timestamp": datetime.datetime.now().isoformat(),
    "prompt": prompt,
    "filename": filename,
    "success": True
})
```

## 🚀 快速开始脚本

创建一个 `generate_icon.py` 文件：

```python
#!/usr/bin/env python3
import google.generativeai as genai
import datetime
import os

API_KEY = "AIzaSyABf99_-KxcQcwjxUGzd9vPwkFmBR6aJ04"

def generate_icon(prompt, size="64x64"):
    """生成极致克制图标"""

    genai.configure(api_key=API_KEY)
    model = genai.GenerativeModel('gemini-3.0-pro-image-exp')

    full_prompt = f"{prompt}, {size} pixels, black and white only, minimalist"

    print(f"🎨 生成: {prompt}")
    response = model.generate_content(full_prompt)

    # 保存图像
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"icon_{timestamp}.png"

    for part in response.candidates[0].content.parts:
        if hasattr(part, 'inline_data'):
            with open(filename, 'wb') as f:
                f.write(part.inline_data.data)
            print(f"✅ 保存为: {filename}")
            return filename

    print("❌ 生成失败")
    return None

# 示例使用
if __name__ == "__main__":
    # 生成链接图标
    generate_icon("minimalist chain link icon, linear style")
```

## 📊 使用情况跟踪

建议创建一个使用记录：

```markdown
# API使用记录

## 已使用：0/20次

### 生成记录

| 序号 | 日期 | 提示词 | 文件 | 状态   |
| ---- | ---- | ------ | ---- | ------ |
| 1    | -    | -      | -    | 待使用 |
| 2    | -    | -      | -    | 待使用 |
| ...  | ...  | ...    | ...  | ...    |
| 20   | -    | -      | -    | 待使用 |
```

## 🎯 物尽其用的建议

### 1. 先规划再生成

- 列出所有需要生成的图像
- 按优先级排序
- 为每个图像编写精确的提示词

### 2. 批量生成相似图像

```python
icons = [
    "chain link",
    "color palette",
    "network nodes",
    "user profile"
]

for icon in icons:
    prompt = f"minimalist {icon} icon, black and white only"
    generate_icon(prompt)
```

### 3. 保留备用机会

- 至少保留3-5次机会用于优化
- 如果某个图像不满意，可以重新生成
- 用于实验新的提示词技巧

### 4. 学习提示词工程

- 每次生成后分析结果
- 调整提示词改进效果
- 记录成功的提示词模板

## 🔒 安全注意事项

1. **不要公开分享API密钥**
2. **不要在代码仓库中提交密钥**
3. **使用环境变量存储密钥**
4. **定期检查使用情况**
5. **发现异常使用立即撤销密钥**

## 🌟 高级技巧

### 1. 图像编辑

```python
# 编辑现有图像
from PIL import Image

image = Image.open("existing.png")
response = model.generate_content([
    "convert to black and white, minimalist style",
    image
])
```

### 2. 风格一致性

```python
# 使用相同的风格描述
style = "black and white only, linear style, geometric precision, minimalist"

prompts = [
    f"chain link icon, {style}",
    f"settings gear icon, {style}",
    f"analytics chart icon, {style}"
]
```

### 3. 分辨率控制

```python
# 指定分辨率
resolutions = ["1024x1024", "2048x2048", "4096x4096"]
# 免费版可能只支持1024x1024
```

## 📞 技术支持

### Google AI文档

- [Gemini API文档](https://ai.google.dev/gemini-api/docs)
- [图像生成指南](https://ai.google.dev/gemini-api/docs/image-generation)
- [API密钥管理](https://makersuite.google.com/app/apikey)

### 社区资源

- [Google AI开发者社区](https://developers.google.com/community)
- [Gemini API论坛](https://developers.google.com/gemini-api/community)
- [Stack Overflow标签](https://stackoverflow.com/questions/tagged/google-gemini-api)

---

## 🎨 为LinkHub生成极致克制图标的具体计划

### 需要生成的图像清单

#### 1. Logo变体 (最高优先级)

- **提示词**：`minimalist geometric "LinkHub" logo, black and white only, negative space design, elegant typography, 256x256 pixels`
- **用途**：品牌标识，网站favicon

#### 2. 背景纹理 (次优先级)

- **提示词**：`subtle black and white noise texture, minimalist, low contrast, seamless pattern, 512x512 pixels`
- **用途**：网站背景，卡片纹理

#### 3. NFC图标优化 (技术性图标)

- **提示词**：`minimalist NFC technology icon, black and white only, radio waves, geometric precision, 64x64 pixels`
- **用途**：Bento网格中最复杂的图标

#### 4. 加载动画帧 (用户体验)

- **提示词**：`minimalist loading animation, 3 dots in circular motion, black and white only, 64x64 pixels`
- **用途**：网站加载状态指示

#### 5-6. 备用优化

- 根据前4个生成效果决定
- 可以重新生成不满意的图像
- 或生成额外的装饰元素

### 执行步骤

1. **环境准备**：在本地设置Python环境
2. **测试生成**：先用简单提示词测试API
3. **正式生成**：按优先级顺序生成图像
4. **集成到项目**：将生成的图像添加到LinkHub
5. **效果评估**：检查图像是否符合极致克制美学

### 成功标准

- ✅ 图像100%黑白灰，无彩色
- ✅ 符合线性简约风格
- ✅ 几何精确，比例协调
- ✅ 与现有设计系统融合
- ✅ 提升整体美学质感

---

**🎯 现在你有了完整的指南，可以在自己的环境中使用这个宝贵的API密钥了！**

**记住：20次机会很珍贵，先规划再生成，物尽其用！** 🚀
