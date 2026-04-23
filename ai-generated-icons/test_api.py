#!/usr/bin/env python3
"""
测试Gemini API密钥是否有效
"""

import os
import sys

# 设置API密钥
os.environ['GEMINI_API_KEY'] = 'AIzaSyABf99_-KxcQcwjxUGzd9vPwkFmBR6aJ04'

try:
    # 尝试导入google-genai
    import google.generativeai as genai
    
    # 配置API
    genai.configure(api_key=os.environ['GEMINI_API_KEY'])
    
    # 列出可用模型（简单测试）
    models = list(genai.list_models())
    
    print("✅ API密钥有效！")
    print(f"找到 {len(models)} 个可用模型")
    
    # 查找图像生成模型
    image_models = [m for m in models if 'generateImage' in str(m.supported_generation_methods)]
    
    if image_models:
        print("✅ 找到图像生成模型：")
        for model in image_models[:3]:  # 只显示前3个
            print(f"  - {model.name}")
    else:
        print("⚠️ 未找到图像生成模型")
        
except ImportError as e:
    print(f"❌ 缺少依赖：{e}")
    print("请安装：pip install google-generativeai pillow")
    
except Exception as e:
    print(f"❌ API测试失败：{e}")
    print("可能的原因：")
    print("1. API密钥无效")
    print("2. 网络连接问题")
    print("3. 服务不可用")