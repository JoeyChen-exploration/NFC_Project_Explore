#!/usr/bin/env python3
"""
兼容Python 3.9的图像生成脚本
基于nano-banana-pro脚本修改
"""

import argparse
import os
import sys
from pathlib import Path
from typing import Optional

try:
    import google.generativeai as genai
    from PIL import Image
    HAS_DEPS = True
except ImportError:
    HAS_DEPS = False


def get_api_key(provided_key):
    """Get API key from argument first, then environment."""
    if provided_key:
        return provided_key
    return os.environ.get("GEMINI_API_KEY")


def validate_resolution(res):
    """Validate resolution argument."""
    res = res.upper()
    if res not in ("1K", "2K", "4K"):
        raise ValueError(f"Invalid resolution: {res}. Must be 1K, 2K, or 4K.")
    return res


def generate_image(prompt, filename, resolution="1K", api_key=None, input_image=None):
    """Generate or edit an image using Gemini 3 Pro Image."""
    
    # Get API key
    key = get_api_key(api_key)
    if not key:
        print("Error: No API key provided.")
        print("Set GEMINI_API_KEY environment variable or pass --api-key")
        sys.exit(1)
    
    # Configure API
    genai.configure(api_key=key)
    
    # Prepare generation config
    generation_config = {
        "temperature": 0.7,
        "top_p": 0.95,
        "top_k": 40,
    }
    
    # Map resolution to dimensions
    res_map = {
        "1K": "1024x1024",
        "2K": "2048x2048", 
        "4K": "4096x4096"
    }
    
    dimensions = res_map.get(resolution.upper(), "1024x1024")
    
    print(f"Generating image with prompt: {prompt[:100]}...")
    print(f"Resolution: {resolution} ({dimensions})")
    
    try:
        # Create model
        model = genai.GenerativeModel('gemini-3.0-pro-image-exp')
        
        # Generate or edit image
        if input_image:
            print(f"Editing image: {input_image}")
            # Load input image
            img = Image.open(input_image)
            response = model.generate_content(
                [prompt, img],
                generation_config=generation_config
            )
        else:
            print("Generating new image...")
            response = model.generate_content(
                prompt,
                generation_config=generation_config
            )
        
        # Extract image from response
        if hasattr(response, 'candidates') and response.candidates:
            for part in response.candidates[0].content.parts:
                if hasattr(part, 'inline_data'):
                    # Save the image
                    img_data = part.inline_data.data
                    img_format = part.inline_data.mime_type.split('/')[-1]
                    
                    # Ensure filename has correct extension
                    output_path = Path(filename)
                    if output_path.suffix.lower() != f'.{img_format}':
                        output_path = output_path.with_suffix(f'.{img_format}')
                    
                    # Save image
                    with open(output_path, 'wb') as f:
                        f.write(img_data)
                    
                    print(f"✅ Image saved to: {output_path}")
                    return str(output_path)
        
        print("❌ No image generated in response")
        return None
        
    except Exception as e:
        print(f"❌ Error generating image: {e}")
        return None


def main():
    parser = argparse.ArgumentParser(
        description="Generate/edit images with Nano Banana Pro (Gemini 3 Pro Image)"
    )
    parser.add_argument("--prompt", required=True, help="Image description or editing instructions")
    parser.add_argument("--filename", required=True, help="Output filename")
    parser.add_argument("--resolution", default="1K", help="Resolution: 1K, 2K, or 4K (default: 1K)")
    parser.add_argument("--api-key", help="Gemini API key (or set GEMINI_API_KEY env var)")
    parser.add_argument("--input-image", help="Path to input image for editing")
    
    args = parser.parse_args()
    
    # Check dependencies
    if not HAS_DEPS:
        print("Error: Missing dependencies.")
        print("Please install: pip install google-generativeai pillow")
        sys.exit(1)
    
    # Validate resolution
    try:
        args.resolution = validate_resolution(args.resolution)
    except ValueError as e:
        print(f"Error: {e}")
        sys.exit(1)
    
    # Generate image
    result = generate_image(
        prompt=args.prompt,
        filename=args.filename,
        resolution=args.resolution,
        api_key=args.api_key,
        input_image=args.input_image
    )
    
    if result:
        print(f"\n🎉 Success! Image saved to: {result}")
        sys.exit(0)
    else:
        print("\n❌ Failed to generate image")
        sys.exit(1)


if __name__ == "__main__":
    main()