from PIL import Image, ImageDraw, ImageFont
import numpy as np
import random
import json

def create_india_satellite_image(width=800, height=600):
    """Create a realistic satellite image of Indian terrain"""
    # Create base image with varied terrain colors
    img = Image.new('RGB', (width, height))
    pixels = np.zeros((height, width, 3), dtype=np.uint8)
    
    # Create terrain variation
    for y in range(height):
        for x in range(width):
            # Base terrain color (brownish-green for Indian landscape)
            base_r = 101 + random.randint(-20, 20)  # Brown component
            base_g = 123 + random.randint(-30, 30)  # Green component  
            base_b = 58 + random.randint(-15, 15)   # Minimal blue
            
            pixels[y, x] = [base_r, base_g, base_b]
    
    img = Image.fromarray(pixels)
    draw = ImageDraw.Draw(img)
    
    # Add major geographical features
    
    # Rivers (Ganges, Yamuna, etc.)
    river_color = (30, 60, 120)  # Dark blue
    # Ganges-like river
    river_points = [(0, height//3), (width//4, height//3 + 20), 
                   (width//2, height//3 - 10), (3*width//4, height//3 + 30), 
                   (width, height//3 + 10)]
    for i in range(len(river_points)-1):
        draw.line([river_points[i], river_points[i+1]], fill=river_color, width=8)
    
    # Yamuna-like river
    yamuna_points = [(width//4, 0), (width//4 + 20, height//4), 
                    (width//4 + 10, height//2)]
    for i in range(len(yamuna_points)-1):
        draw.line([yamuna_points[i], yamuna_points[i+1]], fill=river_color, width=6)
    
    # Urban areas (darker, more structured)
    urban_color = (80, 80, 85)
    draw.rectangle([width//6, height//4, width//6 + 100, height//4 + 80], fill=urban_color)
    draw.rectangle([2*width//3, height//2, 2*width//3 + 120, height//2 + 90], fill=urban_color)
    
    # Agricultural areas (greener patches)
    agri_color = (85, 140, 70)
    draw.rectangle([width//3, height//6, width//3 + 150, height//6 + 100], fill=agri_color)
    draw.rectangle([width//2, 2*height//3, width//2 + 180, 2*height//3 + 80], fill=agri_color)
    
    # Forests (darker green)
    forest_color = (60, 100, 45)
    draw.ellipse([width//8, height//2, width//8 + 120, height//2 + 100], fill=forest_color)
    draw.ellipse([3*width//4, height//8, 3*width//4 + 100, height//8 + 120], fill=forest_color)
    
    return img

def simulate_flood_detection(base_image, flood_severity='moderate'):
    """Apply ML-simulated flood detection overlay"""
    width, height = base_image.size
    
    # Create flood overlay
    overlay = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    
    # Define flood parameters based on severity
    if flood_severity == 'severe':
        flood_areas = 8
        opacity_range = (120, 180)
        size_multiplier = 1.5
    elif flood_severity == 'moderate':
        flood_areas = 5
        opacity_range = (80, 140)
        size_multiplier = 1.0
    else:  # mild
        flood_areas = 3
        opacity_range = (60, 100)
        size_multiplier = 0.7
    
    # Generate flood zones
    flood_zones = []
    for i in range(flood_areas):
        # Focus floods near rivers and low-lying areas (bottom 40% of image)
        center_x = random.randint(50, width - 50)
        center_y = random.randint(int(height * 0.6), height - 50)
        
        # Flood area size
        radius_x = int((50 + random.randint(0, 100)) * size_multiplier)
        radius_y = int((40 + random.randint(0, 80)) * size_multiplier)
        
        # Flood color with varying opacity
        opacity = random.randint(*opacity_range)
        flood_color = (255, 0, 0, opacity)  # Red with transparency
        
        # Draw irregular flood shape
        points = []
        num_points = 8
        for j in range(num_points):
            angle = (2 * np.pi * j) / num_points
            # Add some randomness to make it look natural
            r_x = radius_x + random.randint(-20, 20)
            r_y = radius_y + random.randint(-15, 15)
            x = center_x + int(r_x * np.cos(angle))
            y = center_y + int(r_y * np.sin(angle))
            points.append((x, y))
        
        draw.polygon(points, fill=flood_color)
        
        # Store flood zone data
        flood_zones.append({
            'center': (center_x, center_y),
            'severity': flood_severity,
            'area_km2': round((radius_x * radius_y * 3.14159) / 10000, 1),  # Rough conversion
            'confidence': round(0.7 + random.random() * 0.25, 2)
        })
    
    # Combine base image with flood overlay
    result = base_image.copy()
    result.paste(overlay, (0, 0), overlay)
    
    return result, flood_zones

def generate_analysis_report(location, date, flood_zones):
    """Generate flood analysis report"""
    total_area = sum(zone['area_km2'] for zone in flood_zones)
    avg_confidence = sum(zone['confidence'] for zone in flood_zones) / len(flood_zones)
    
    # Estimate affected population (rough calculation for Indian context)
    population_density = 400  # people per km² (India average)
    affected_population = int(total_area * population_density * 0.6)  # 60% exposure rate
    
    report = {
        'location': location,
        'analysis_date': date,
        'summary': {
            'total_flooded_area_km2': round(total_area, 1),
            'number_of_flood_zones': len(flood_zones),
            'estimated_affected_population': affected_population,
            'average_confidence': round(avg_confidence, 2),
            'risk_level': 'HIGH' if total_area > 100 else 'MODERATE' if total_area > 50 else 'LOW'
        },
        'flood_zones': flood_zones,
        'recommendations': [
            'Immediate evacuation of low-lying areas',
            'Deploy emergency response teams',
            'Monitor river water levels continuously',
            'Coordinate with local disaster management authorities',
            'Set up temporary relief camps in safe zones'
        ]
    }
    
    return report

def main():
    """Main flood detection simulation"""
    # Configuration
    location = "Mumbai, Maharashtra"
    date = "2024-01-15"
    flood_severity = 'moderate'  # mild, moderate, severe
    
    print(f"🛰️  India Flood Detection System")
    print(f"📍 Location: {location}")
    print(f"📅 Date: {date}")
    print(f"⚠️  Severity: {flood_severity}")
    print("-" * 50)
    
    # Step 1: Create satellite image
    print("1. Generating satellite imagery...")
    satellite_img = create_india_satellite_image()
    
    # Step 2: Apply flood detection
    print("2. Running ML flood detection...")
    flood_result, flood_zones = simulate_flood_detection(satellite_img, flood_severity)
    
    # Step 3: Generate analysis report
    print("3. Generating analysis report...")
    report = generate_analysis_report(location, date, flood_zones)
    
    # Step 4: Save results
    print("4. Saving results...")
    satellite_img.save('static/india_satellite_original.png')
    flood_result.save('static/india_flood_overlay.png')
    
    with open('static/flood_analysis_report.json', 'w') as f:
        json.dump(report, f, indent=2)
    
    # Step 5: Display results
    print("\n📊 ANALYSIS RESULTS:")
    print(f"🌊 Total Flooded Area: {report['summary']['total_flooded_area_km2']} km²")
    print(f"👥 Estimated Affected Population: {report['summary']['estimated_affected_population']:,}")
    print(f"🎯 Average Confidence: {report['summary']['average_confidence']*100:.1f}%")
    print(f"⚠️  Risk Level: {report['summary']['risk_level']}")
    
    print(f"\n💾 Files saved:")
    print(f"   • static/india_satellite_original.png")
    print(f"   • static/india_flood_overlay.png") 
    print(f"   • static/flood_analysis_report.json")
    
    print(f"\n🚨 FLOOD ALERT for {location}:")
    if report['summary']['risk_level'] == 'HIGH':
        print("   HIGH RISK - Immediate action required!")
    elif report['summary']['risk_level'] == 'MODERATE':
        print("   MODERATE RISK - Monitor situation closely")
    else:
        print("   LOW RISK - Continue monitoring")

if __name__ == "__main__":
    main()
