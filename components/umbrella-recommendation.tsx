"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLocation } from "@/components/location-provider"
import { useTranslations } from "@/hooks/use-translations"
import { fetchWeatherData } from "@/lib/api"
import type { WeatherData } from "@/types/weather"
import { Umbrella, Sun, CloudRain } from "lucide-react"

interface UmbrellaRecommendationProps {
  className?: string
}

export function UmbrellaRecommendation({ className }: UmbrellaRecommendationProps) {
  const { coordinates, isLoading: locationLoading } = useLocation()
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [needsUmbrella, setNeedsUmbrella] = useState(false)
  const t = useTranslations()

  // Use a ref to track if we've already fetched data for these coordinates
  const lastFetchedCoords = useRef<string | null>(null)
  const currentCoordsKey = `${coordinates.latitude.toFixed(2)},${coordinates.longitude.toFixed(2)}`

  useEffect(() => {
    if (locationLoading) return

    // Skip fetching if we've already fetched for these coordinates
    if (lastFetchedCoords.current === currentCoordsKey && weatherData) {
      return
    }

    const getWeatherData = async () => {
      setIsLoading(true)
      try {
        const data = await fetchWeatherData(coordinates.latitude, coordinates.longitude)
        setWeatherData(data)

        // Check if umbrella is needed in the next 12 hours
        const next12Hours = data.properties.timeseries.slice(0, 12)
        const willRain = next12Hours.some((forecast) => {
          const symbol =
            forecast.data.next_1_hours?.summary?.symbol_code || forecast.data.next_6_hours?.summary?.symbol_code || ""
          return symbol.includes("rain")
        })

        setNeedsUmbrella(willRain)
        // Update the last fetched coordinates
        lastFetchedCoords.current = currentCoordsKey
      } catch (err) {
        console.error("Error fetching weather data:", err)
        // Don't show error in this component, just handle gracefully
      } finally {
        setIsLoading(false)
      }
    }

    getWeatherData()
  }, [coordinates.latitude, coordinates.longitude, locationLoading, currentCoordsKey, weatherData])

  if (isLoading || locationLoading) {
    return (
      <Card className={`card-gradient ${className}`}>
        <CardHeader>
          <CardTitle>{t("umbrellaNeeded")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-32">
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-muted h-16 w-16"></div>
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`card-gradient ${className}`}>
      <CardHeader>
        <CardTitle>{t("umbrellaNeeded")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <div className={`mb-4 ${needsUmbrella ? "text-6xl text-blue-500" : "text-9xl text-yellow-500"}`}>
            {needsUmbrella ? <Umbrella /> : <Sun />}
          </div>
          <h3 className="text-2xl font-bold mb-2">{needsUmbrella ? t("yesUmbrella") : t("noUmbrella")}</h3>
          <p className="text-muted-foreground">{needsUmbrella ? t("rainExpected") : t("noRainExpected")}</p>

          {needsUmbrella && (
            <div className="mt-4 flex justify-center">
              <div className="relative w-16 h-24">
                <div className="absolute top-0 left-0 w-full">
                  <CloudRain className="w-8 h-8 text-blue-500 animate-rain" />
                </div>
                <div className="absolute top-0 left-8 w-full delay-300">
                  <CloudRain className="w-8 h-8 text-blue-500 animate-rain" />
                </div>
                <div className="absolute bottom-0 w-full flex justify-center">
                  <Umbrella className="w-12 h-12 text-primary" />
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
