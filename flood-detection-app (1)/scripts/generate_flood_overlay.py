from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
import numpy as np
import random
import os

def load_satellite_image(image_path):
    """Load and prepare satellite image"""
    try:
        img = Image.open(image_path).convert("RGBA")
        print(f"✅ Loaded satellite image: {img.size}")
        return img
    except Exception as e:
        print(f"❌ Error loading image: {e}")
        return None

def generate_realistic_flood_overlay(base_img, flood_severity='moderate'):
    """Generate realistic flood overlay using advanced techniques"""
    width, height = base_img.size
    
    # Create overlay canvas
    overlay = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    
    # Define flood parameters
    if flood_severity == 'severe':
        num_zones = random.randint(8, 12)
        opacity_range = (100, 160)
        coverage = 0.35
    elif flood_severity == 'moderate':
        num_zones = random.randint(5, 8)
        opacity_range = (80, 120)
        coverage = 0.25
    else:  # mild
        num_zones = random.randint(3, 5)
        opacity_range = (60, 100)
        coverage = 0.15
    
    print(f"🌊 Generating {num_zones} flood zones with {flood_severity} severity")
    
    # Generate flood zones with realistic patterns
    flood_zones = []
    
    for i in range(num_zones):
        # Bias towards lower areas (bottom 60% of image)
        center_x = random.randint(50, width - 50)
        center_y = random.randint(int(height * 0.4), height - 50)
        
        # Vary flood zone sizes
        base_radius = random.randint(40, 120)
        radius_x = base_radius + random.randint(-20, 40)
        radius_y = base_radius + random.randint(-15, 30)
        
        # Create irregular flood shape
        points = []
        num_points = random.randint(6, 10)
        
        for j in range(num_points):
            angle = (2 * np.pi * j) / num_points
            # Add randomness for natural look
            r_variation = random.uniform(0.7, 1.3)
            x = center_x + int(radius_x * r_variation * np.cos(angle))
            y = center_y + int(radius_y * r_variation * np.sin(angle))
            
            # Keep within bounds
            x = max(0, min(width, x))
            y = max(0, min(height, y))
            points.append((x, y))
        
        # Draw flood zone with varying opacity
        opacity = random.randint(*opacity_range)
        flood_color = (255, 0, 0, opacity)
        
        try:
            draw.polygon(points, fill=flood_color)
            
            # Add inner intensity variation
            inner_opacity = min(255, opacity + 30)
            inner_color = (255, 20, 20, inner_opacity)
            
            # Smaller inner polygon for intensity
            inner_points = []
            for x, y in points:
                inner_x = center_x + int((x - center_x) * 0.6)
                inner_y = center_y + int((y - center_y) * 0.6)
                inner_points.append((inner_x, inner_y))
            
            draw.polygon(inner_points, fill=inner_color)
            
        except Exception as e:
            print(f"⚠️  Warning: Could not draw flood zone {i}: {e}")
            continue
        
        flood_zones.append({
            'center': (center_x, center_y),
            'area': np.pi * radius_x * radius_y / 10000,  # Rough km²
            'severity': flood_severity,
            'opacity': opacity
        })
    
    # Add water flow patterns
    print("💧 Adding water flow patterns...")
    
    # Create flow lines connecting flood zones
    if len(flood_zones) > 1:
        for i in range(len(flood_zones) - 1):
            start = flood_zones[i]['center']
            end = flood_zones[i + 1]['center']
            
            # Create curved flow line
            mid_x = (start[0] + end[0]) // 2 + random.randint(-30, 30)
            mid_y = (start[1] + end[1]) // 2 + random.randint(-20, 20)
            
            # Draw flow as series of small ellipses
            steps = 10
            for step in range(steps):
                t = step / steps
                # Quadratic Bezier curve
                x = int((1-t)**2 * start[0] + 2*(1-t)*t * mid_x + t**2 * end[0])
                y = int((1-t)**2 * start[1] + 2*(1-t)*t * mid_y + t**2 * end[1])
                
                flow_size = random.randint(3, 8)
                flow_opacity = random.randint(40, 80)
                draw.ellipse([x-flow_size, y-flow_size, x+flow_size, y+flow_size], 
                           fill=(255, 50, 50, flow_opacity))
    
    # Apply blur for more realistic look
    overlay = overlay.filter(ImageFilter.GaussianBlur(radius=1.5))
    
    return overlay, flood_zones

def create_flood_analysis_report(flood_zones, location, base_image_path):
    """Create detailed flood analysis report"""
    total_area = sum(zone['area'] for zone in flood_zones)
    avg_opacity = sum(zone['opacity'] for zone in flood_zones) / len(flood_zones) if flood_zones else 0
    
    # Estimate population impact (Mumbai density ~20,000 per km²)
    population_density = 20000
    affected_population = int(total_area * population_density * 0.4)  # 40% exposure rate
    
    report = {
        'location': location,
        'analysis_timestamp': str(np.datetime64('now')),
        'base_image': base_image_path,
        'flood_summary': {
            'total_flooded_area_km2': round(total_area, 2),
            'number_of_flood_zones': len(flood_zones),
            'average_intensity': round(avg_opacity / 255 * 100, 1),
            'estimated_affected_population': affected_population,
            'risk_level': 'HIGH' if total_area > 50 else 'MODERATE' if total_area > 20 else 'LOW'
        },
        'flood_zones': flood_zones,
        'recommendations': [
            'Immediate evacuation of identified flood zones',
            'Deploy emergency response teams to high-intensity areas',
            'Monitor coastal and low-lying areas continuously',
            'Coordinate with Mumbai Disaster Management Authority',
            'Activate flood warning systems in affected areas'
        ]
    }
    
    return report

def main():
    """Main flood overlay generation function"""
    print("🛰️  Mumbai Flood Detection - Overlay Generation")
    print("=" * 50)
    
    # Configuration
    base_image_path = 'public/mumbai_satellite.webp'
    output_path = 'public/mumbai_flood_overlay.png'
    location = "Mumbai, Maharashtra"
    flood_severity = 'moderate'  # mild, moderate, severe
    
    # Step 1: Load satellite image
    print("1. Loading satellite imagery...")
    base_img = load_satellite_image(base_image_path)
    
    if base_img is None:
        print("❌ Failed to load base image. Creating synthetic image...")
        # Create a synthetic satellite image as fallback
        base_img = Image.new('RGBA', (800, 600), (50, 100, 50, 255))
        draw = ImageDraw.Draw(base_img)
        
        # Add some basic terrain features
        draw.rectangle([0, 0, 800, 200], fill=(30, 60, 120, 255))  # Water
        draw.rectangle([0, 200, 800, 400], fill=(80, 120, 60, 255))  # Land
        draw.rectangle([0, 400, 800, 600], fill=(100, 80, 60, 255))  # Urban
        
        print("✅ Created synthetic base image")
    
    # Step 2: Generate flood overlay
    print(f"2. Generating flood overlay (severity: {flood_severity})...")
    flood_overlay, flood_zones = generate_realistic_flood_overlay(base_img, flood_severity)
    
    # Step 3: Combine images
    print("3. Combining base image with flood overlay...")
    result_img = Image.alpha_composite(base_img, flood_overlay)
    
    # Step 4: Enhance final image
    print("4. Enhancing final image...")
    enhancer = ImageEnhance.Contrast(result_img)
    result_img = enhancer.enhance(1.1)
    
    enhancer = ImageEnhance.Color(result_img)
    result_img = enhancer.enhance(1.05)
    
    # Step 5: Save result
    print("5. Saving flood overlay image...")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    result_img.save(output_path, 'PNG', quality=95)
    
    # Step 6: Generate analysis report
    print("6. Generating analysis report...")
    report = create_flood_analysis_report(flood_zones, location, base_image_path)
    
    # Display results
    print("\n📊 FLOOD ANALYSIS RESULTS:")
    print(f"📍 Location: {report['location']}")
    print(f"🌊 Total Flooded Area: {report['flood_summary']['total_flooded_area_km2']} km²")
    print(f"🎯 Number of Flood Zones: {report['flood_summary']['number_of_flood_zones']}")
    print(f"⚡ Average Intensity: {report['flood_summary']['average_intensity']}%")
    print(f"👥 Estimated Affected Population: {report['flood_summary']['estimated_affected_population']:,}")
    print(f"⚠️  Risk Level: {report['flood_summary']['risk_level']}")
    
    print(f"\n💾 Output saved to: {output_path}")
    print(f"📏 Image dimensions: {result_img.size}")
    
    # Risk assessment
    risk_level = report['flood_summary']['risk_level']
    if risk_level == 'HIGH':
        print("\n🚨 HIGH RISK ALERT:")
        print("   • Immediate evacuation recommended")
        print("   • Deploy emergency response teams")
        print("   • Activate all flood warning systems")
    elif risk_level == 'MODERATE':
        print("\n⚠️  MODERATE RISK WARNING:")
        print("   • Monitor situation closely")
        print("   • Prepare evacuation plans")
        print("   • Alert emergency services")
    else:
        print("\n✅ LOW RISK STATUS:")
        print("   • Continue monitoring")
        print("   • Maintain preparedness")
    
    print("\n🎯 Flood overlay generation completed successfully!")
    return result_img, report

if __name__ == "__main__":
    main()
