"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CalendarIcon, Download, MapPin, Satellite, Loader2, AlertTriangle, Droplets } from "lucide-react"
import { format } from "date-fns"
import IndiaMap from "@/components/india-map"
import FloodVisualization from "@/components/flood-visualization"

interface FloodResults {
  originalImage: string
  overlayImage: string
  floodedAreas: Array<{
    lat: number
    lng: number
    severity: "mild" | "moderate" | "severe"
    area: number
  }>
  statistics: {
    totalFloodedArea: number
    affectedPopulation: number
    severityDistribution: Record<string, number>
    confidence: number
  }
  location: {
    lat: number
    lng: number
    state: string
    district: string
  }
}

const INDIAN_CITIES = [
  "Mumbai, Maharashtra",
  "Delhi, Delhi",
  "Bangalore, Karnataka",
  "Chennai, Tamil Nadu",
  "Kolkata, West Bengal",
  "Hyderabad, Telangana",
  "Pune, Maharashtra",
  "Ahmedabad, Gujarat",
  "Surat, Gujarat",
  "Jaipur, Rajasthan",
  "Lucknow, Uttar Pradesh",
  "Kanpur, Uttar Pradesh",
  "Nagpur, Maharashtra",
  "Patna, Bihar",
  "Indore, Madhya Pradesh",
  "Bhopal, Madhya Pradesh",
  "Ludhiana, Punjab",
  "Agra, Uttar Pradesh",
  "Nashik, Maharashtra",
  "Vadodara, Gujarat",
]

export default function IndiaFloodDetection() {
  const [location, setLocation] = useState("")
  const [date, setDate] = useState<Date>()
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState<FloodResults | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredCities, setFilteredCities] = useState<string[]>([])

  const handleLocationChange = (value: string) => {
    setLocation(value)
    if (value.length > 2) {
      const filtered = INDIAN_CITIES.filter((city) => city.toLowerCase().includes(value.toLowerCase()))
      setFilteredCities(filtered)
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }

  const selectCity = (city: string) => {
    setLocation(city)
    setShowSuggestions(false)
  }

  const handleRunDetection = async () => {
    if (!location || !date) {
      alert("Please enter both location and date")
      return
    }

    setIsProcessing(true)

    try {
      const response = await fetch("/api/detect-flood-india", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          location,
          date: date.toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error("Detection failed")
      }

      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error("Error:", error)
      alert("Detection failed. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = async () => {
    if (!results?.overlayImage) return

    try {
      const response = await fetch("/api/download-flood-map", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          location,
          date: date?.toISOString(),
          overlayImage: results.overlayImage,
        }),
      })

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `flood-map-${location.replace(/[^a-zA-Z0-9]/g, "-")}-${format(date!, "yyyy-MM-dd")}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Download failed:", error)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "mild":
        return "bg-yellow-500"
      case "moderate":
        return "bg-orange-500"
      case "severe":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-3 py-4 max-w-7xl">
        {/* Mobile-Optimized Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-4xl font-bold mb-2 flex items-center justify-center gap-2">
            <Droplets className="h-6 w-6 md:h-8 md:w-8 text-blue-400" />
            India Flood Detection
          </h1>
          <p className="text-sm md:text-base text-gray-400 px-2">AI-powered satellite imagery analysis</p>
        </div>

        {/* Mobile-First Layout - Stack on mobile, grid on desktop */}
        <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-6">
          {/* Input Panel - Full width on mobile */}
          <Card className="bg-gray-800 border-gray-700 lg:col-span-1">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-4 w-4 text-blue-400" />
                Detection Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium mb-2">Location in India</label>
                <Input
                  placeholder="Mumbai, Maharashtra"
                  value={location}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 h-12 text-base"
                />
                {showSuggestions && filteredCities.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {filteredCities.slice(0, 5).map((city, index) => (
                      <button
                        key={index}
                        onClick={() => selectCity(city)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-600 text-white text-sm border-b border-gray-600 last:border-b-0"
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal bg-gray-700 border-gray-600 text-white hover:bg-gray-600 h-12"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      className="bg-gray-800 text-white"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <Button
                onClick={handleRunDetection}
                disabled={isProcessing || !location || !date}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 h-12 text-base font-medium"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Satellite className="mr-2 h-4 w-4" />
                    Run Detection
                  </>
                )}
              </Button>

              {results && (
                <>
                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    className="w-full border-gray-600 text-white hover:bg-gray-700 bg-transparent h-12"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Map
                  </Button>

                  {/* Mobile-Optimized Statistics */}
                  <div className="space-y-3 pt-4 border-t border-gray-700">
                    <h3 className="font-semibold text-base">Results</h3>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-gray-700 p-3 rounded text-center">
                        <div className="text-gray-400 text-xs">Flooded Area</div>
                        <div className="font-bold text-lg">{results.statistics.totalFloodedArea} km²</div>
                      </div>
                      <div className="bg-gray-700 p-3 rounded text-center">
                        <div className="text-gray-400 text-xs">Confidence</div>
                        <div className="font-bold text-lg">{(results.statistics.confidence * 100).toFixed(0)}%</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium">Severity:</div>
                      {Object.entries(results.statistics.severityDistribution).map(([severity, count]) => (
                        <div key={severity} className="flex items-center justify-between text-sm py-1">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded ${getSeverityColor(severity)}`}></div>
                            <span className="capitalize">{severity}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {count}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Map Panel - Full width on mobile, spans 2 columns on desktop */}
          <Card className="bg-gray-800 border-gray-700 lg:col-span-2">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Interactive Map - India</CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-6">
              <IndiaMap floodResults={results} selectedLocation={location} isProcessing={isProcessing} />
            </CardContent>
          </Card>
        </div>

        {/* Mobile-Optimized Flood Alert */}
        {results && results.statistics.totalFloodedArea > 50 && (
          <Alert className="mt-6 border-red-600 bg-red-900/20">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-200 text-sm">
              <strong>High Risk Alert:</strong> {results.statistics.totalFloodedArea.toFixed(1)} km² affected in{" "}
              {results.location.district}, {results.location.state}.
            </AlertDescription>
          </Alert>
        )}

        {/* Mobile-Optimized Visualization Panel */}
        {results && (
          <Card className="bg-gray-800 border-gray-700 mt-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Satellite Analysis</CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-6">
              <FloodVisualization
                originalImage={results.originalImage}
                overlayImage={results.overlayImage}
                location={location}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
