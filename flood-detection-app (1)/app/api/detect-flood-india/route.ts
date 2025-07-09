import { type NextRequest, NextResponse } from "next/server"

// Indian cities with coordinates
const INDIAN_CITY_COORDS: Record<string, { lat: number; lng: number; state: string; district: string }> = {
  mumbai: { lat: 19.076, lng: 72.8777, state: "Maharashtra", district: "Mumbai" },
  delhi: { lat: 28.7041, lng: 77.1025, state: "Delhi", district: "New Delhi" },
  bangalore: { lat: 12.9716, lng: 77.5946, state: "Karnataka", district: "Bangalore Urban" },
  chennai: { lat: 13.0827, lng: 80.2707, state: "Tamil Nadu", district: "Chennai" },
  kolkata: { lat: 22.5726, lng: 88.3639, state: "West Bengal", district: "Kolkata" },
  hyderabad: { lat: 17.385, lng: 78.4867, state: "Telangana", district: "Hyderabad" },
  pune: { lat: 18.5204, lng: 73.8567, state: "Maharashtra", district: "Pune" },
  ahmedabad: { lat: 23.0225, lng: 72.5714, state: "Gujarat", district: "Ahmedabad" },
  jaipur: { lat: 26.9124, lng: 75.7873, state: "Rajasthan", district: "Jaipur" },
  lucknow: { lat: 26.8467, lng: 80.9462, state: "Uttar Pradesh", district: "Lucknow" },
  patna: { lat: 25.5941, lng: 85.1376, state: "Bihar", district: "Patna" },
  bhopal: { lat: 23.2599, lng: 77.4126, state: "Madhya Pradesh", district: "Bhopal" },
}

function getLocationCoords(location: string) {
  const cityName = location.toLowerCase().split(",")[0].trim()
  return (
    INDIAN_CITY_COORDS[cityName] || {
      lat: 21.1458 + (Math.random() - 0.5) * 10,
      lng: 79.0882 + (Math.random() - 0.5) * 15,
      state: "Unknown State",
      district: "Unknown District",
    }
  )
}

function generateFloodAreas(centerLat: number, centerLng: number) {
  const areas = []
  const numAreas = Math.floor(Math.random() * 8) + 3 // 3-10 flood areas

  const severities: Array<"mild" | "moderate" | "severe"> = ["mild", "moderate", "severe"]

  for (let i = 0; i < numAreas; i++) {
    const severity = severities[Math.floor(Math.random() * severities.length)]
    const area =
      severity === "severe"
        ? Math.random() * 50 + 20
        : severity === "moderate"
          ? Math.random() * 30 + 10
          : Math.random() * 15 + 5

    areas.push({
      lat: centerLat + (Math.random() - 0.5) * 0.2,
      lng: centerLng + (Math.random() - 0.5) * 0.2,
      severity,
      area: Number.parseFloat(area.toFixed(1)),
    })
  }

  return areas
}

export async function POST(request: NextRequest) {
  try {
    const { location, date } = await request.json()

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 3000))

    const locationData = getLocationCoords(location)
    const floodedAreas = generateFloodAreas(locationData.lat, locationData.lng)

    // Calculate statistics
    const totalFloodedArea = floodedAreas.reduce((sum, area) => sum + area.area, 0)
    const severityDistribution = floodedAreas.reduce(
      (acc, area) => {
        acc[area.severity] = (acc[area.severity] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Estimate affected population (rough calculation)
    const populationDensity =
      locationData.state === "Maharashtra"
        ? 365
        : locationData.state === "Delhi"
          ? 11320
          : locationData.state === "West Bengal"
            ? 1028
            : 400
    const affectedPopulation = Math.floor(totalFloodedArea * populationDensity * 0.7)

    const results = {
      originalImage: "/placeholder.svg?height=400&width=600&text=Satellite+Image+India&bg=228B22",
      overlayImage: "/placeholder.svg?height=400&width=600&text=Flood+Detection+Overlay&bg=rgba(255,0,0,0.4)",
      floodedAreas,
      statistics: {
        totalFloodedArea: Number.parseFloat(totalFloodedArea.toFixed(1)),
        affectedPopulation,
        severityDistribution,
        confidence: 0.75 + Math.random() * 0.2, // 75-95% confidence
      },
      location: locationData,
      metadata: {
        location,
        date,
        processingTime: "3.2s",
        algorithm: "DeepFlood-India v2.1",
        satelliteSource: "Sentinel-2, ISRO RISAT",
      },
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error("Flood detection error:", error)
    return NextResponse.json({ error: "Failed to process flood detection" }, { status: 500 })
  }
}
