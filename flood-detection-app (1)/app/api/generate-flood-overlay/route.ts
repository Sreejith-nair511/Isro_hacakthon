import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { baseImage, location } = await request.json()

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Create a canvas to generate the flood overlay
    const canvas = new OffscreenCanvas(800, 600)
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      throw new Error("Could not get canvas context")
    }

    // Create base satellite-like image
    const gradient = ctx.createLinearGradient(0, 0, 800, 600)
    gradient.addColorStop(0, "#1e40af") // Blue (water)
    gradient.addColorStop(0.3, "#059669") // Green (vegetation)
    gradient.addColorStop(0.6, "#92400e") // Brown (urban)
    gradient.addColorStop(1, "#374151") // Gray (developed areas)

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 800, 600)

    // Add some terrain variation
    ctx.fillStyle = "#065f46"
    ctx.fillRect(100, 100, 200, 150)
    ctx.fillRect(400, 200, 180, 120)

    ctx.fillStyle = "#1f2937"
    ctx.fillRect(200, 300, 300, 200)
    ctx.fillRect(50, 450, 150, 100)

    // Generate flood overlay areas
    const floodAreas = [
      { x: 50, y: 400, width: 200, height: 150, intensity: 0.7 },
      { x: 300, y: 350, width: 250, height: 200, intensity: 0.8 },
      { x: 600, y: 300, width: 150, height: 180, intensity: 0.6 },
      { x: 100, y: 200, width: 180, height: 120, intensity: 0.5 },
      { x: 450, y: 450, width: 200, height: 100, intensity: 0.9 },
    ]

    // Apply flood overlays with varying intensities
    floodAreas.forEach((area) => {
      const alpha = area.intensity * 0.6 // Max 60% opacity
      ctx.fillStyle = `rgba(255, 0, 0, ${alpha})`
      ctx.fillRect(area.x, area.y, area.width, area.height)

      // Add some irregular edges to make it look more natural
      ctx.fillStyle = `rgba(255, 50, 50, ${alpha * 0.8})`
      ctx.beginPath()
      ctx.ellipse(
        area.x + area.width / 2,
        area.y + area.height / 2,
        area.width / 2 + 20,
        area.height / 2 + 15,
        0,
        0,
        2 * Math.PI,
      )
      ctx.fill()
    })

    // Add some water flow patterns
    ctx.strokeStyle = "rgba(255, 0, 0, 0.4)"
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(100, 300)
    ctx.quadraticCurveTo(300, 250, 500, 400)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(200, 450)
    ctx.quadraticCurveTo(400, 420, 600, 480)
    ctx.stroke()

    // Add text overlay
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)"
    ctx.font = "16px Arial"
    ctx.fillText(`Flood Analysis: ${location}`, 20, 30)
    ctx.font = "12px Arial"
    ctx.fillText(`Generated: ${new Date().toLocaleString()}`, 20, 50)

    // Convert to blob
    const blob = await canvas.convertToBlob({ type: "image/png" })

    return new NextResponse(blob, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-cache",
      },
    })
  } catch (error) {
    console.error("Error generating flood overlay:", error)
    return NextResponse.json({ error: "Failed to generate flood overlay" }, { status: 500 })
  }
}
