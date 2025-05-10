"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface Coordinates {
  latitude: number
  longitude: number
}

interface LocationContextType {
  coordinates: Coordinates
  setCoordinates: (coords: Coordinates) => void
  isLoading: boolean
  error: string | null
}

const defaultCoordinates = {
  latitude: 35.6895, // Tokyo
  longitude: 139.6917,
}

const LocationContext = createContext<LocationContextType | undefined>(undefined)

export function LocationProvider({ children }: { children: ReactNode }) {
  const [coordinates, setCoordinates] = useState<Coordinates>(defaultCoordinates)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Try to get stored coordinates first
    const storedCoords = localStorage.getItem("weatherCoordinates")
    if (storedCoords) {
      try {
        const parsedCoords = JSON.parse(storedCoords) as Coordinates
        setCoordinates(parsedCoords)
        setIsLoading(false)
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
        },
        (err) => {
          console.error("Geolocation error:", err)
          setError("Unable to retrieve your location. Using default location.")
          setIsLoading(false)
        },
      )
    } else {
      setError("Geolocation is not supported by your browser. Using default location.")
      setIsLoading(false)
    }
  }, [])

  const handleSetCoordinates = (coords: Coordinates) => {
    setCoordinates(coords)
    localStorage.setItem("weatherCoordinates", JSON.stringify(coords))
  }

  return (
    <LocationContext.Provider
      value={{
        coordinates,
        setCoordinates: handleSetCoordinates,
        isLoading,
        error,
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
