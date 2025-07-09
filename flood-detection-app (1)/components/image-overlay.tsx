"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"

interface ImageOverlayProps {
  originalImage: string
  overlayImage: string
}

export default function ImageOverlay({ originalImage, overlayImage }: ImageOverlayProps) {
  const [showOverlay, setShowOverlay] = useState(true)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Satellite Imagery Analysis</h3>
        <Button
          onClick={() => setShowOverlay(!showOverlay)}
          variant="outline"
          size="sm"
          className="border-gray-600 text-white hover:bg-gray-700"
        >
          {showOverlay ? (
            <>
              <EyeOff className="mr-2 h-4 w-4" />
              Hide Overlay
            </>
          ) : (
            <>
              <Eye className="mr-2 h-4 w-4" />
              Show Overlay
            </>
          )}
        </Button>
      </div>

      <div className="relative rounded-lg overflow-hidden bg-gray-700">
        <img src={originalImage || "/placeholder.svg"} alt="Satellite imagery" className="w-full h-auto" />
        {showOverlay && (
          <img
            src={overlayImage || "/placeholder.svg"}
            alt="Flood detection overlay"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
      </div>

      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 opacity-60 rounded"></div>
          <span>Detected Flooded Areas</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 opacity-60 rounded"></div>
          <span>Water Bodies</span>
        </div>
      </div>
    </div>
  )
}
