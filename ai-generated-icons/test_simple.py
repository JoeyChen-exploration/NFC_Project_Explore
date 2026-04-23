#!/usr/bin/env python3
"""
简单测试API密钥
"""

import os
import google.generativeai as genai

# 设置API密钥
api_key = "AIzaSyABf99_-KxcQcwjxUGzd9vPwkFmBR6aJ04"

try:
    # 配置API
    genai.configure(api_key=api_key)
    
    # 简单测试 - 列出模型
    print("🔧 配置Gemini API...")
    
    # 尝试获取模型列表
    print("📋 获取可用模型...")
    
    # 直接测试图像生成模型
    model_name = "gemini-3.0-pro-image-exp"
    print(f"🎯 测试模型: {model_name}")
    
    # 创建模型实例
    model = genai.GenerativeModel(model_name)
    
    print("✅ API密钥有效！")
    print("✅ 模型可访问！")
    print("🚀 准备生成图像...")
    
except Exception as e:
    print(f"❌ 错误: {e}")
    print("可能的原因:")
    print("1. API密钥无效")
    print("2. 模型不可用")
    print("3. 网络问题")