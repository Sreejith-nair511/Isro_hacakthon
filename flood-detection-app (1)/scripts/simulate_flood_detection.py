from PIL import Image, ImageDraw
import numpy as np
import io
import base64

def create_satellite_image():
    """Create a simulated satellite image"""
    # Create a landscape-like image
    width, height = 600, 400
    img = Image.new('RGB', (width, height), color='lightblue')
    draw = ImageDraw.Draw(img)
    
    # Add some terrain features
    # Green areas (land)
    draw.rectangle([0, height//2, width, height], fill='darkgreen')
    
    # Brown areas (urban/dry land)
    draw.rectangle([100, height//2, 300, height-50], fill='saddlebrown')
    draw.rectangle([400, height//2, 550, height-30], fill='saddlebrown')
    
    # Blue areas (existing water bodies)
    draw.ellipse([50, height//3, 150, height//2], fill='darkblue')
    draw.ellipse([450, height//4, 580, height//2], fill='darkblue')
    
    return img

def apply_flood_overlay(base_image):
    """Apply flood detection overlay to the base image"""
    width, height = base_image.size
    
    # Create overlay for flooded areas (bottom 30% with some random patches)
    overlay = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    
    # Main flood area (bottom 30%)
    flood_start = int(height * 0.7)
    draw.rectangle([0, flood_start, width, height], fill=(255, 0, 0, 100))
    
    # Additional flood patches
    draw.ellipse([100, height//2, 250, flood_start + 20], fill=(255, 0, 0, 80))
    draw.ellipse([350, height//2 + 30, 500, flood_start + 10], fill=(255, 0, 0, 90))
    
    # Combine base image with overlay
    result = base_image.copy()
    result.paste(overlay, (0, 0), overlay)
    
    return result

def simulate_ml_inference(location, date):
    """Simulate the ML inference pipeline"""
    print(f"Processing flood detection for {location} on {date}")
    print("Loading satellite imagery...")
    
    # Create base satellite image
    satellite_img = create_satellite_image()
    
    print("Running ML model inference...")
    print("Detecting water bodies and flood patterns...")
    
    # Apply flood detection overlay
    result_img = apply_flood_overlay(satellite_img)
    
    print("Analysis complete!")
    print("Detected flood areas in bottom 30% of region")
    print("Confidence: 87%")
    
    return satellite_img, result_img

# Example usage
if __name__ == "__main__":
    location = "Houston, TX"
    date = "2024-01-15"
    
    original, overlay = simulate_ml_inference(location, date)
    
    # Save results
    original.save('static/sample_satellite.png')
    overlay.save('static/output_overlay.png')
    
    print("Images saved to static/ directory")
