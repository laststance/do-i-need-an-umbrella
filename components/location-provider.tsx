"use client"

import { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from "react"
import { getLocationName } from "@/lib/geocoding"
import { useTranslations } from "@/hooks/use-translations"
import { useLanguage } from "@/components/language-provider"
import { fetchWeatherData } from "@/lib/api"

interface Coordinates {
  latitude: number
  longitude: number
}

interface LocationContextType {
  coordinates: Coordinates
  setCoordinates: (coords: Coordinates) => void
  isLoading: boolean
  error: string | null
  locationName: string
  setLocationName: (name: string) => void
  isLoadingLocationName: boolean
}

const defaultCoordinates = {
  latitude: 35.6895, // Tokyo
  longitude: 139.6917,
}

const LocationContext = createContext<LocationContextType | undefined>(undefined)

export function LocationProvider({ children }: { children: ReactNode }) {
  const t = useTranslations()
  const { language } = useLanguage()
  const [coordinates, setCoordinates] = useState<Coordinates>(defaultCoordinates)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [locationName, setLocationName] = useState<string>(t("loadingLocation"))
  const [isLoadingLocationName, setIsLoadingLocationName] = useState(true)
  
  // Track if initial location fetch has been completed
  const initialLocationFetchRef = useRef(false)
  // Track if coordinates have been initialized
  const coordinatesInitializedRef = useRef(false)
  // Track if a fetch is currently in progress
  const fetchInProgressRef = useRef(false)

  // Load coordinates from localStorage or geolocation API
  useEffect(() => {
    if (coordinatesInitializedRef.current) {
      return;
    }

    async function initializeCoordinates() {
      // Try to get stored coordinates first
      const storedCoords = localStorage.getItem("weatherCoordinates")
      if (storedCoords) {
        try {
          const parsedCoords = JSON.parse(storedCoords) as Coordinates
          setCoordinates(parsedCoords)
          setIsLoading(false)
          coordinatesInitializedRef.current = true
          return
        } catch (e) {
          // If parsing fails, continue to geolocation
          localStorage.removeItem("weatherCoordinates")
        }
      }

      // Try to get user's current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const newCoords = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            }
            setCoordinates(newCoords)
            localStorage.setItem("weatherCoordinates", JSON.stringify(newCoords))
            setIsLoading(false)
            coordinatesInitializedRef.current = true
          },
          (err) => {
            console.error("Geolocation error:", err)
            setError(t("geolocationError"))
            setIsLoading(false)
            coordinatesInitializedRef.current = true
          }
        )
      } else {
        setError(t("geolocationNotSupported"))
        setIsLoading(false)
        coordinatesInitializedRef.current = true
      }
    }

    initializeCoordinates()
  }, [t])

  // Fetch location name based on coordinates - memoized to prevent recreation on render
  const fetchLocationName = useCallback(async () => {
    // Prevent concurrent fetches
    if (fetchInProgressRef.current) return
    fetchInProgressRef.current = true

    setIsLoadingLocationName(true)
    try {
      // First try to get location from weather API
      const weatherData = await fetchWeatherData(coordinates.latitude, coordinates.longitude)

      if (weatherData.properties?.location?.name) {
        // Use location from Met.no API if available
        let name = weatherData.properties.location.name

        // Add country/region if available
        if (weatherData.properties.location.region) {
          name += `, ${weatherData.properties.location.region}`
        } else if (weatherData.properties.location.country) {
          name += `, ${weatherData.properties.location.country}`
        }

        setLocationName(name)
      } else {
        // Fallback to Google geocoding if Met.no doesn't provide location
        const name = await getLocationName(coordinates.latitude, coordinates.longitude, language)
        setLocationName(name)
      }
    } catch (err) {
      console.error("Error fetching location name:", err)
      try {
        // Try Google geocoding as a fallback
        const name = await getLocationName(coordinates.latitude, coordinates.longitude, language)
        setLocationName(name)
      } catch (geocodeErr) {
        console.error("Error fetching location from geocoding:", geocodeErr)
        setLocationName(t("unknownLocation"))
      }
    } finally {
      setIsLoadingLocationName(false)
      fetchInProgressRef.current = false
    }
  }, [coordinates.latitude, coordinates.longitude, language, t])

  // Fetch location name only when coordinates are loaded and not yet fetched
  useEffect(() => {
    if (isLoading || initialLocationFetchRef.current) {
      return
    }
    
    // Only fetch once on initial render
    initialLocationFetchRef.current = true
    fetchLocationName()
  }, [isLoading, fetchLocationName])

  // The handler for manually setting coordinates should trigger a new location fetch
  const handleSetCoordinates = useCallback((coords: Coordinates) => {
    // Update coordinates
    setCoordinates(coords)
    localStorage.setItem("weatherCoordinates", JSON.stringify(coords))
    
    // Reset the fetch flag to allow a new fetch when coordinates change manually
    initialLocationFetchRef.current = false
  }, [])

  return (
    <LocationContext.Provider
      value={{
        coordinates,
        setCoordinates: handleSetCoordinates,
        isLoading,
        error,
        locationName,
        setLocationName,
        isLoadingLocationName,
      }}
    >
      {children}
    </LocationContext.Provider>
  )
}

export function useLocation() {
  const context = useContext(LocationContext)
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider")
  }
  return context
}
