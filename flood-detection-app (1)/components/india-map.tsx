"use client"

import { useEffect, useRef, useCallback } from "react"

interface FloodArea {
  lat: number
  lng: number
  severity: "mild" | "moderate" | "severe"
  area: number
}

interface FloodResults {
  floodedAreas: FloodArea[]
  location: {
    lat: number
    lng: number
    state: string
    district: string
  }
}

interface IndiaMapProps {
  floodResults: FloodResults | null
  selectedLocation: string
  isProcessing: boolean
}

export default function IndiaMap({ floodResults, selectedLocation, isProcessing }: IndiaMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const mapIdRef = useRef<string>(`map-${Date.now()}-${Math.random()}`)

  const cleanupMap = useCallback(() => {
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.off()
        mapInstanceRef.current.remove()
      } catch (error) {
        console.warn("Error during map cleanup:", error)
      } finally {
        mapInstanceRef.current = null
      }
    }

    if (mapRef.current) {
      mapRef.current.innerHTML = ""
      // Generate new unique ID for next map instance
      mapIdRef.current = `map-${Date.now()}-${Math.random()}`
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return

    let mounted = true

    const initMap = async () => {
      try {
        const L = (await import("leaflet")).default

        // Clean up any existing map first
        cleanupMap()

        // Wait for cleanup to complete
        await new Promise((resolve) => setTimeout(resolve, 100))

        // Check if component is still mounted
        if (!mounted || !mapRef.current) return

        // Fix for default markers in Leaflet
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        })

        // Set unique ID for the map container
        mapRef.current.id = mapIdRef.current

        // Create new map instance with error handling
        const map = L.map(mapRef.current, {
          center: [21.1458, 79.0882],
          zoom: 5,
          zoomControl: true,
          attributionControl: true,
          preferCanvas: false,
        })

        // Wait for map to be ready
        await new Promise((resolve) => {
          map.whenReady(() => resolve(undefined))
        })

        // Check if component is still mounted before proceeding
        if (!mounted) {
          map.remove()
          return
        }

        // Add OpenStreetMap tiles
        const tileLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
          maxZoom: 18,
        })

        tileLayer.addTo(map)

        // Wait for tiles to load
        await new Promise((resolve) => {
          tileLayer.on("load", () => resolve(undefined))
          // Fallback timeout
          setTimeout(() => resolve(undefined), 2000)
        })

        if (!mounted) {
          map.remove()
          return
        }

        // Add India state boundaries (simplified GeoJSON)
        const indiaStates = {
          type: "FeatureCollection" as const,
          features: [
            {
              type: "Feature" as const,
              properties: { name: "Maharashtra" },
              geometry: {
                type: "Polygon" as const,
                coordinates: [
                  [
                    [72.6, 15.6],
                    [80.9, 15.6],
                    [80.9, 22.0],
                    [72.6, 22.0],
                    [72.6, 15.6],
                  ],
                ],
              },
            },
            {
              type: "Feature" as const,
              properties: { name: "Uttar Pradesh" },
              geometry: {
                type: "Polygon" as const,
                coordinates: [
                  [
                    [77.0, 24.0],
                    [84.6, 24.0],
                    [84.6, 30.4],
                    [77.0, 30.4],
                    [77.0, 24.0],
                  ],
                ],
              },
            },
            {
              type: "Feature" as const,
              properties: { name: "Karnataka" },
              geometry: {
                type: "Polygon" as const,
                coordinates: [
                  [
                    [74.0, 11.5],
                    [78.6, 11.5],
                    [78.6, 18.4],
                    [74.0, 18.4],
                    [74.0, 11.5],
                  ],
                ],
              },
            },
          ],
        }

        // Add state boundaries
        try {
          L.geoJSON(indiaStates, {
            style: {
              color: "#4A90E2",
              weight: 2,
              opacity: 0.6,
              fillOpacity: 0.1,
            },
            onEachFeature: (feature, layer) => {
              layer.bindPopup(`<b>${feature.properties.name}</b><br>State of India`)
            },
          }).addTo(map)
        } catch (geoError) {
          console.warn("Error adding state boundaries:", geoError)
        }

        // Add major rivers (simplified)
        const majorRivers = [
          {
            name: "Ganges",
            coords: [
              [77.6, 28.6],
              [78.0, 27.2],
              [82.5, 25.3],
              [87.0, 22.6],
            ] as [number, number][],
          },
          {
            name: "Yamuna",
            coords: [
              [77.2, 28.6],
              [77.6, 27.2],
              [78.0, 25.4],
            ] as [number, number][],
          },
          {
            name: "Godavari",
            coords: [
              [73.4, 19.9],
              [77.3, 18.7],
              [81.8, 16.3],
            ] as [number, number][],
          },
          {
            name: "Krishna",
            coords: [
              [73.3, 17.6],
              [76.2, 16.2],
              [80.9, 15.8],
            ] as [number, number][],
          },
        ]

        try {
          majorRivers.forEach((river) => {
            L.polyline(river.coords, {
              color: "#1E90FF",
              weight: 3,
              opacity: 0.7,
            })
              .addTo(map)
              .bindPopup(`<b>${river.name} River</b>`)
          })
        } catch (riverError) {
          console.warn("Error adding rivers:", riverError)
        }

        // Add location marker if results exist
        if (floodResults?.location && mounted) {
          try {
            const { lat, lng, state, district } = floodResults.location

            L.marker([lat, lng]).addTo(map).bindPopup(`<b>${selectedLocation}</b><br>${district}, ${state}`).openPopup()

            // Add flood areas
            const floodLayers: any[] = []
            floodResults.floodedAreas.forEach((area, index) => {
              if (!mounted) return

              const color =
                area.severity === "severe" ? "#dc2626" : area.severity === "moderate" ? "#ea580c" : "#f59e0b"
              const radius = area.severity === "severe" ? 2000 : area.severity === "moderate" ? 1500 : 1000

              const circle = L.circle([area.lat, area.lng], {
                color: color,
                fillColor: color,
                fillOpacity: 0.4,
                radius: radius,
                weight: 2,
              })
                .addTo(map)
                .bindPopup(`
            <b>Flood Zone ${index + 1}</b><br>
            Severity: <span style="color: ${color}; font-weight: bold;">${area.severity.toUpperCase()}</span><br>
            Area: ${area.area.toFixed(1)} km²
          `)

              floodLayers.push(circle)
            })

            // Fit map to show all flood areas
            if (mounted && floodLayers.length > 0) {
              const group = new L.featureGroup(floodLayers)
              map.fitBounds(group.getBounds().pad(0.1))
            }
          } catch (floodError) {
            console.warn("Error adding flood areas:", floodError)
          }
        }

        // Store map instance only if component is still mounted
        if (mounted) {
          mapInstanceRef.current = map
        } else {
          map.remove()
        }
      } catch (error) {
        console.error("Error initializing map:", error)
        if (mapInstanceRef.current) {
          try {
            mapInstanceRef.current.remove()
          } catch (cleanupError) {
            console.warn("Error during error cleanup:", cleanupError)
          }
          mapInstanceRef.current = null
        }
      }
    }

    initMap()

    return () => {
      mounted = false
      cleanupMap()
    }
  }, [floodResults, selectedLocation, cleanupMap])

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
        integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
        crossOrigin=""
      />
      <div className="relative">
        <div
          ref={mapRef}
          className="w-full rounded-lg"
          style={{
            minHeight: "300px",
            height: "50vh",
            maxHeight: "500px",
          }}
        />

        {isProcessing && (
          <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center rounded-lg">
            <div className="text-center text-white px-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
              <p className="text-sm">Processing satellite data...</p>
            </div>
          </div>
        )}

        {/* Mobile-Optimized Map Legend */}
        <div className="absolute bottom-2 left-2 bg-gray-800/95 p-2 rounded-lg text-xs max-w-[140px]">
          <div className="font-semibold mb-1 text-xs">Legend</div>
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded"></div>
              <span className="text-xs">States</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-0.5 bg-blue-400"></div>
              <span className="text-xs">Rivers</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full opacity-60"></div>
              <span className="text-xs">Floods</span>
            </div>
          </div>
        </div>

        {/* Mobile zoom controls hint */}
        <div className="absolute top-2 right-2 bg-gray-800/80 px-2 py-1 rounded text-xs text-gray-300">
          Pinch to zoom
        </div>
      </div>
    </>
  )
}
