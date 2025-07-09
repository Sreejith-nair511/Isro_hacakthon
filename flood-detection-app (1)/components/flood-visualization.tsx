"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Eye, Layers, ImageIcon, RotateCcw, Download, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface FloodVisualizationProps {
  originalImage: string
  overlayImage: string
  location: string
}

export default function FloodVisualization({ originalImage, overlayImage, location }: FloodVisualizationProps) {
  const [currentView, setCurrentView] = useState<"original" | "overlay" | "comparison">("comparison")
  const [isGeneratingOverlay, setIsGeneratingOverlay] = useState(false)
  const [overlayGenerated, setOverlayGenerated] = useState(false)
  const [actualOverlayImage, setActualOverlayImage] = useState<string>("")

  const generateFloodOverlay = async () => {
    setIsGeneratingOverlay(true)
    try {
      const response = await fetch("/api/generate-flood-overlay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          baseImage: "/mumbai_satellite.webp",
          location: location,
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const overlayUrl = URL.createObjectURL(blob)
        setActualOverlayImage(overlayUrl)
        setOverlayGenerated(true)
      }
    } catch (error) {
      console.error("Error generating overlay:", error)
    } finally {
      setIsGeneratingOverlay(false)
    }
  }

  useEffect(() => {
    // Auto-generate overlay when component mounts
    generateFloodOverlay()
  }, [location])

  const downloadImage = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Download failed:", error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h3 className="text-lg font-semibold">Analysis - {location}</h3>

        {/* Mobile-Optimized View Toggle */}
        <div className="flex gap-1 bg-gray-700 p-1 rounded-lg">
          <Button
            onClick={() => setCurrentView("original")}
            variant={currentView === "original" ? "default" : "ghost"}
            size="sm"
            className="flex-1 text-xs px-2 py-1 h-8"
          >
            <ImageIcon className="mr-1 h-3 w-3" />
            Original
          </Button>
          <Button
            onClick={() => setCurrentView("overlay")}
            variant={currentView === "overlay" ? "default" : "ghost"}
            size="sm"
            className="flex-1 text-xs px-2 py-1 h-8"
            disabled={!overlayGenerated}
          >
            <Eye className="mr-1 h-3 w-3" />
            Overlay
          </Button>
          <Button
            onClick={() => setCurrentView("comparison")}
            variant={currentView === "comparison" ? "default" : "ghost"}
            size="sm"
            className="flex-1 text-xs px-2 py-1 h-8"
          >
            <Layers className="mr-1 h-3 w-3" />
            Compare
          </Button>
        </div>
      </div>

      {/* Mobile-First Image Display - Stack on mobile, side-by-side on larger screens */}
      <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-4">
        {(currentView === "original" || currentView === "comparison") && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-300 flex items-center gap-2 text-sm">
                <ImageIcon className="h-3 w-3" />
                Original Satellite
              </h4>
              <Button
                onClick={() => downloadImage("/mumbai_satellite.webp", "mumbai_original.webp")}
                variant="outline"
                size="sm"
                className="border-gray-600 text-white hover:bg-gray-700 h-8 px-2"
              >
                <Download className="h-3 w-3" />
              </Button>
            </div>
            <div className="relative rounded-lg overflow-hidden bg-gray-700 shadow-lg">
              <img
                src="/mumbai_satellite.webp"
                alt="Original satellite imagery"
                className="w-full h-48 sm:h-64 object-cover"
              />
              <div className="absolute top-2 left-2 bg-black/70 px-2 py-1 rounded text-xs font-medium">Pre-Flood</div>
              <div className="absolute bottom-2 right-2 bg-green-600/80 px-2 py-1 rounded text-xs">Normal</div>
            </div>
          </div>
        )}

        {(currentView === "overlay" || currentView === "comparison") && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-300 flex items-center gap-2 text-sm">
                <Eye className="h-3 w-3" />
                Flood Detection
                {overlayGenerated && (
                  <Badge variant="secondary" className="text-xs">
                    AI
                  </Badge>
                )}
              </h4>
              <div className="flex gap-1">
                <Button
                  onClick={generateFloodOverlay}
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-white hover:bg-gray-700 bg-transparent h-8 px-2"
                  disabled={isGeneratingOverlay}
                >
                  {isGeneratingOverlay ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <RotateCcw className="h-3 w-3" />
                  )}
                </Button>
                {overlayGenerated && (
                  <Button
                    onClick={() => downloadImage(actualOverlayImage, "flood_overlay.png")}
                    variant="outline"
                    size="sm"
                    className="border-gray-600 text-white hover:bg-gray-700 h-8 px-2"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
            <div className="relative rounded-lg overflow-hidden bg-gray-700 shadow-lg">
              {isGeneratingOverlay ? (
                <div className="w-full h-48 sm:h-64 flex items-center justify-center bg-gray-800">
                  <div className="text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-400" />
                    <p className="text-gray-300 text-sm">Generating...</p>
                  </div>
                </div>
              ) : overlayGenerated ? (
                <>
                  <img
                    src={actualOverlayImage || "/placeholder.svg"}
                    alt="Flood detection overlay"
                    className="w-full h-48 sm:h-64 object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-red-600/80 px-2 py-1 rounded text-xs font-medium">
                    Flood Alert
                  </div>
                  <div className="absolute bottom-2 right-2 bg-red-500/80 px-2 py-1 rounded text-xs">High Risk</div>
                </>
              ) : (
                <div className="w-full h-48 sm:h-64 flex items-center justify-center bg-gray-800">
                  <div className="text-center px-4">
                    <Eye className="h-8 w-8 mx-auto mb-3 opacity-50 text-gray-500" />
                    <p className="text-gray-400 text-sm">Tap regenerate to create overlay</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile-Optimized Analysis Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-gray-700 p-3 rounded-lg border-l-4 border-red-500">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 bg-red-500 opacity-80 rounded"></div>
            <span className="font-medium text-sm">Severe</span>
          </div>
          <p className="text-xs text-gray-300">Coastal areas</p>
          <p className="text-xs text-gray-400">15-25% affected</p>
        </div>

        <div className="bg-gray-700 p-3 rounded-lg border-l-4 border-orange-500">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 bg-orange-500 opacity-80 rounded"></div>
            <span className="font-medium text-sm">Moderate</span>
          </div>
          <p className="text-xs text-gray-300">Urban drainage</p>
          <p className="text-xs text-gray-400">10-15% affected</p>
        </div>

        <div className="bg-gray-700 p-3 rounded-lg border-l-4 border-yellow-500">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 bg-yellow-500 opacity-80 rounded"></div>
            <span className="font-medium text-sm">Mild</span>
          </div>
          <p className="text-xs text-gray-300">Elevated areas</p>
          <p className="text-xs text-gray-400">5-10% affected</p>
        </div>
      </div>

      {/* Mobile-Optimized Technical Details */}
      <div className="bg-gray-700 p-4 rounded-lg">
        <h4 className="font-medium mb-2 flex items-center gap-2 text-sm">
          <Layers className="h-3 w-3" />
          Analysis Method
        </h4>
        <div className="space-y-2 text-xs text-gray-300">
          <p>• High-resolution satellite imagery processing</p>
          <p>• AI-powered water body detection algorithms</p>
          <p>• Digital elevation model integration</p>
          <p>• Historical flood pattern analysis</p>
          <p>• 85-92% confidence accuracy level</p>
        </div>
      </div>
    </div>
  )
}
