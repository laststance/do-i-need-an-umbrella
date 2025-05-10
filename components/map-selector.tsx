"use client"

import { useEffect, useRef, useState } from "react"
import { useLocation } from "@/components/location-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslations } from "@/hooks/use-translations"
import { MapPin, Navigation, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useTheme } from "next-themes"

interface MapSelectorProps {
  className?: string
}

// Declare google variable to prevent Typescript errors
declare global {
  interface Window {
    google: any
    gm_authFailure: () => void
    initMap: () => void
  }
}

let isMapInitialized = false

export function MapSelector({ className }: MapSelectorProps) {
  const { coordinates, setCoordinates } = useLocation()
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  const t = useTranslations()
  const { theme } = useTheme()
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [marker, setMarker] = useState<google.maps.Marker | null>(null)

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newCoords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }
          setCoordinates(newCoords)

          // If map is loaded, update the map center and marker
          if (map && marker) {
            const newPosition = { lat: newCoords.latitude, lng: newCoords.longitude }
            map.setCenter(newPosition)
            marker.setPosition(newPosition)
          }

          setMapError(null)
        },
        (err) => {
          console.error("Geolocation error:", err)
          setMapError(t("geolocationError"))
        },
      )
    } else {
      setMapError(t("geolocationNotSupported"))
    }
  }

  // Initialize map function that will be called by the Google Maps script
  typeof window !== "undefined" && isMapInitialized === false && (window.initMap = () => {
    if (!mapRef.current) return

    try {
      setMapLoaded(true)
      setMapError(null)

      // Map styles for dark mode
      const darkModeStyle = [
        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
        {
          featureType: "administrative.locality",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "poi",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "poi.park",
          elementType: "geometry",
          stylers: [{ color: "#263c3f" }],
        },
        {
          featureType: "poi.park",
          elementType: "labels.text.fill",
          stylers: [{ color: "#6b9a76" }],
        },
        {
          featureType: "road",
          elementType: "geometry",
          stylers: [{ color: "#38414e" }],
        },
        {
          featureType: "road",
          elementType: "geometry.stroke",
          stylers: [{ color: "#212a37" }],
        },
        {
          featureType: "road",
          elementType: "labels.text.fill",
          stylers: [{ color: "#9ca5b3" }],
        },
        {
          featureType: "road.highway",
          elementType: "geometry",
          stylers: [{ color: "#746855" }],
        },
        {
          featureType: "road.highway",
          elementType: "geometry.stroke",
          stylers: [{ color: "#1f2835" }],
        },
        {
          featureType: "road.highway",
          elementType: "labels.text.fill",
          stylers: [{ color: "#f3d19c" }],
        },
        {
          featureType: "transit",
          elementType: "geometry",
          stylers: [{ color: "#2f3948" }],
        },
        {
          featureType: "transit.station",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#17263c" }],
        },
        {
          featureType: "water",
          elementType: "labels.text.fill",
          stylers: [{ color: "#515c6d" }],
        },
        {
          featureType: "water",
          elementType: "labels.text.stroke",
          stylers: [{ color: "#17263c" }],
        },
      ]

      const newMap = new window.google.maps.Map(mapRef.current, {
        center: { lat: coordinates.latitude, lng: coordinates.longitude },
        zoom: 10,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: theme === "dark" ? darkModeStyle : [],
      })

      const newMarker = new window.google.maps.Marker({
        position: { lat: coordinates.latitude, lng: coordinates.longitude },
        map: newMap,
        draggable: true,
        animation: window.google.maps.Animation.DROP,
      })

      // Handle marker drag
      newMarker.addListener("dragend", () => {
        const position = newMarker.getPosition()
        if (position) {
          setCoordinates({
            latitude: position.lat(),
            longitude: position.lng(),
          })
        }
      })

      // Handle map click
      newMap.addListener("click", (e: google.maps.MapMouseEvent) => {
        const position = e.latLng
        if (position) {
          newMarker.setPosition(position)
          setCoordinates({
            latitude: position.lat(),
            longitude: position.lng(),
          })
        }
      })

      setMap(newMap)
      setMarker(newMarker)
      isMapInitialized = true
    } catch (error) {
      console.error("Error initializing map:", error)
      setMapError(t("mapInitError"))
    }
  })

  // Update map style when theme changes
  useEffect(() => {
    if (map && theme) {
      const darkModeStyle = [
        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
        {
          featureType: "administrative.locality",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "poi",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "poi.park",
          elementType: "geometry",
          stylers: [{ color: "#263c3f" }],
        },
        {
          featureType: "poi.park",
          elementType: "labels.text.fill",
          stylers: [{ color: "#6b9a76" }],
        },
        {
          featureType: "road",
          elementType: "geometry",
          stylers: [{ color: "#38414e" }],
        },
        {
          featureType: "road",
          elementType: "geometry.stroke",
          stylers: [{ color: "#212a37" }],
        },
        {
          featureType: "road",
          elementType: "labels.text.fill",
          stylers: [{ color: "#9ca5b3" }],
        },
        {
          featureType: "road.highway",
          elementType: "geometry",
          stylers: [{ color: "#746855" }],
        },
        {
          featureType: "road.highway",
          elementType: "geometry.stroke",
          stylers: [{ color: "#1f2835" }],
        },
        {
          featureType: "road.highway",
          elementType: "labels.text.fill",
          stylers: [{ color: "#f3d19c" }],
        },
        {
          featureType: "transit",
          elementType: "geometry",
          stylers: [{ color: "#2f3948" }],
        },
        {
          featureType: "transit.station",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#17263c" }],
        },
        {
          featureType: "water",
          elementType: "labels.text.fill",
          stylers: [{ color: "#515c6d" }],
        },
        {
          featureType: "water",
          elementType: "labels.text.stroke",
          stylers: [{ color: "#17263c" }],
        },
      ]

      map.setOptions({
        styles: theme === "dark" ? darkModeStyle : [],
      })
    }
  }, [theme, map])

  // Add global error handler for Google Maps
  useEffect(() => {
    window.gm_authFailure = () => {
      setMapError("authError")
      console.error("Google Maps authentication error")
    }

    return () => {
      // Remove global error handler
      if (window.gm_authFailure) {
        delete window.gm_authFailure
      }
    }
  }, [])


  // Update map when coordinates change
  useEffect(() => {
    if (map && marker && mapLoaded) {
      const position = { lat: coordinates.latitude, lng: coordinates.longitude }
      map.setCenter(position)
      marker.setPosition(position)
    }
  }, [coordinates, map, marker, mapLoaded])

  // Preset locations
  const presetLocations = [
    { name: "Tokyo", lat: 35.6895, lng: 139.6917 },
    { name: "New York", lat: 40.7128, lng: -74.006 },
    { name: "London", lat: 51.5074, lng: -0.1278 },
    { name: "Sydney", lat: -33.8688, lng: 151.2093 },
    { name: "Rio de Janeiro", lat: -22.9068, lng: -43.1729 },
  ]

  // Fallback UI when Google Maps is not available
  const renderFallback = () => {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        {mapError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t("mapError")}</AlertTitle>
            <AlertDescription>
              {mapError === "noApiKey" && t("noApiKey")}
              {mapError === "loadError" && t("mapLoadError")}
              {mapError === "authError" && t("mapAuthError")}
              {mapError === "initError" && t("mapInitError")}
              {mapError === "geolocationError" && t("geolocationError")}
              {mapError === "geolocationNotSupported" && t("geolocationNotSupported")}
            </AlertDescription>
          </Alert>
        )}

        <div className="text-center mb-4">
          <MapPin className="h-12 w-12 mx-auto mb-2 text-primary" />
          <p>{t("currentCoordinates")}</p>
          <p className="font-mono mt-2">
            {coordinates.latitude.toFixed(4)}, {coordinates.longitude.toFixed(4)}
          </p>
        </div>

        <Button onClick={getCurrentLocation} className="w-full">
          <Navigation className="h-4 w-4 mr-2" />
          {t("getCurrentLocation")}
        </Button>
      </div>
    )
  }

  return (
    <Card className={`card-gradient ${className}`}>
      <CardHeader className="p-3">
        <CardTitle className="text-base">{t("selectLocation")}</CardTitle>
      </CardHeader>
      <CardContent className="p-0 pb-2">
        {mapLoaded && !mapError ? (
          <div className="relative">
            <div ref={mapRef} className="h-[250px] w-full" />
            <div className="absolute bottom-2 right-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={getCurrentLocation}
                className="bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800 dark:text-white"
              >
                <Navigation className="h-4 w-4 mr-1" />
                {t("myLocation")}
              </Button>
            </div>
          </div>
        ) : (
          renderFallback()
        )}
      </CardContent>
      <CardContent className="px-3 py-2">
        <div className="space-y-4">
          {/* Current coordinates display */}
          <div className="flex items-center justify-center p-2 bg-muted/50 backdrop-blur-sm rounded-md">
            <MapPin className="h-5 w-5 mr-2 text-primary" />
            <span className="font-mono text-sm">
              {coordinates.latitude.toFixed(4)}, {coordinates.longitude.toFixed(4)}
            </span>
          </div>

          {/* Preset locations */}
          <div className="space-y-2">
            <p className="text-sm font-medium">{t("presetLocations")}</p>
            <div className="flex flex-wrap gap-2">
              {presetLocations.map((location) => (
                <Button
                  key={location.name}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCoordinates({
                      latitude: location.lat,
                      longitude: location.lng,
                    })
                  }}
                >
                  {location.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
