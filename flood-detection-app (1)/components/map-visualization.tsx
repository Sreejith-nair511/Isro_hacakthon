"use client"

import { useEffect, useRef } from "react"

interface FloodedArea {
  lat: number
  lng: number
  severity: number
}

interface MapVisualizationProps {
  location: string
  floodedAreas: FloodedArea[]
}

export default function MapVisualization({ location, floodedAreas }: MapVisualizationProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window === "undefined") return

    // Dynamically import Leaflet to avoid SSR issues
    const initMap = async () => {
      const L = (await import("leaflet")).default

      // Fix for default markers in Leaflet
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      })

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
      }

      // Default coordinates (Houston, TX as example)
      const defaultLat = 29.7604
      const defaultLng = -95.3698

      const map = L.map(mapRef.current!).setView([defaultLat, defaultLng], 10)

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map)

      // Add location marker
      L.marker([defaultLat, defaultLng]).addTo(map).bindPopup(`<b>${location}</b><br>Analysis Location`)

      // Add flooded area markers
      floodedAreas.forEach((area, index) => {
        const color = area.severity > 0.7 ? "#dc2626" : area.severity > 0.4 ? "#ea580c" : "#f59e0b"

        L.circle([area.lat, area.lng], {
          color: color,
          fillColor: color,
          fillOpacity: 0.3,
          radius: 500 + area.severity * 1000,
        })
          .addTo(map)
          .bindPopup(`<b>Flooded Area ${index + 1}</b><br>Severity: ${(area.severity * 100).toFixed(1)}%`)
      })

      mapInstanceRef.current = map
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
      }
    }
  }, [location, floodedAreas])

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
        integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
        crossOrigin=""
      />
      <div ref={mapRef} className="w-full h-96 rounded-lg" style={{ minHeight: "400px" }} />
    </>
  )
}
