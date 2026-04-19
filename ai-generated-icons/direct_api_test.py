#!/usr/bin/env python
"""
直接API测试 - 最简单的形式
"""

import requests
import json
import base64

# API配置
API_KEY = "AIzaSyABf99_-KxcQcwjxUGzd9vPwkFmBR6aJ04"
MODEL = "gemini-3.0-pro-image-exp"
URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={API_KEY}"

# 简单的提示
prompt = "Create a simple black and white minimalist icon of a chain link, 64x64 pixels"

# 请求数据
data = {
    "contents": [{
        "parts": [{
            "text": prompt
        }]
    }],
    "generationConfig": {
        "temperature": 0.7,
        "topP": 0.95,
        "topK": 40
    }
}

print(f"🔧 使用API密钥: {API_KEY[:10]}...")
print(f"🎯 模型: {MODEL}")
print(f"📝 提示: {prompt}")

try:
    # 发送请求
    response = requests.post(URL, json=data, timeout=30)
    
    print(f"📡 状态码: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print("✅ API请求成功！")
        
        # 检查响应结构
        if "candidates" in result and result["candidates"]:
            candidate = result["candidates"][0]
            if "content" in candidate and "parts" in candidate["content"]:
                print("🎨 图像生成响应接收成功")
                
                # 尝试提取图像
                for part in candidate["content"]["parts"]:
                    if "inlineData" in part:
                        print("🖼️ 找到图像数据！")
                        mime_type = part["inlineData"]["mimeType"]
                        data = part["inlineData"]["data"]
                        print(f"📊 MIME类型: {mime_type}")
                        print(f"📊 数据大小: {len(data)} bytes")
                        
                        # 保存图像
                        with open("test_icon.png", "wb") as f:
                            f.write(base64.b64decode(data))
                        print("💾 图像已保存为 test_icon.png")
                        break
                else:
                    print("⚠️ 响应中没有图像数据")
                    print("完整响应:", json.dumps(result, indent=2)[:500])
            else:
                print("⚠️ 响应结构异常")
                print("响应:", json.dumps(result, indent=2)[:500])
        else:
            print("❌ 响应中没有candidates")
            print("完整响应:", json.dumps(result, indent=2))
    else:
        print(f"❌ API请求失败: {response.status_code}")
        print(f"错误信息: {response.text}")
        
except Exception as e:
    print(f"❌ 发生错误: {e}")
    import traceback
    traceback.print_exc()