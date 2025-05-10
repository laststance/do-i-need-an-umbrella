"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useLocation } from "@/components/location-provider"
import { useUnit } from "@/components/unit-provider"
import { useTranslations } from "@/hooks/use-translations"
import { fetchWeatherData } from "@/lib/api"
import type { WeatherData } from "@/types/weather"
import { formatDate, formatTime } from "@/lib/date-utils"
import { Cloud, CloudRain, Sun, CloudSun, CloudFog, CloudSnow, Wind } from "lucide-react"

export function WeatherDisplay() {
  const { coordinates, isLoading: locationLoading } = useLocation()
  const { unit, convertTemperature } = useUnit()
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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
        setError(null)
        // Update the last fetched coordinates
        lastFetchedCoords.current = currentCoordsKey
      } catch (err) {
        console.error("Error fetching weather data:", err)
        setError(err instanceof Error ? err.message : t("weatherFetchError"))
      } finally {
        setIsLoading(false)
      }
    }

    getWeatherData()
  }, [coordinates.latitude, coordinates.longitude, locationLoading, t, currentCoordsKey, weatherData])

  // Get current hour's forecast
  const currentForecast = weatherData?.properties?.timeseries?.[0]

  // Get next 24 hours forecasts
  const next24HoursForecasts = weatherData?.properties?.timeseries?.slice(0, 24)

  const getWeatherIcon = (symbol: string) => {
    if (!symbol) return <Sun />

    if (symbol.includes("rain")) return <CloudRain />
    if (symbol.includes("cloud")) {
      if (symbol.includes("sun")) return <CloudSun />
      return <Cloud />
    }
    if (symbol.includes("fog")) return <CloudFog />
    if (symbol.includes("snow")) return <CloudSnow />
    if (symbol.includes("wind")) return <Wind />

    return <Sun />
  }

  if (isLoading || locationLoading) {
    return (
      <Card className="card-gradient">
        <CardHeader>
          <CardTitle>{t("currentWeather")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="card-gradient">
        <CardHeader>
          <CardTitle>{t("currentWeather")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center">
            <p className="text-red-500">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!currentForecast) {
    return (
      <Card className="card-gradient">
        <CardHeader>
          <CardTitle>{t("currentWeather")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center">
            <p>{t("noWeatherData")}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentTemp = currentForecast.data.instant.details.air_temperature
  const displayTemp = convertTemperature(currentTemp)
  const symbol =
    currentForecast.data.next_1_hours?.summary?.symbol_code ||
    currentForecast.data.next_6_hours?.summary?.symbol_code ||
    ""

  return (
    <Card className="card-gradient">
      <CardHeader>
        <CardTitle>{t("currentWeather")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{formatDate(new Date(currentForecast.time))}</p>
              <h2 className="text-3xl font-bold mt-1">
                {displayTemp.toFixed(1)}°{unit === "celsius" ? "C" : "F"}
              </h2>
            </div>
            <div className="text-5xl text-primary">{getWeatherIcon(symbol)}</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 backdrop-blur-sm rounded-lg p-3">
              <p className="text-sm text-muted-foreground">{t("humidity")}</p>
              <p className="text-xl font-medium">{currentForecast.data.instant.details.relative_humidity}%</p>
            </div>
            <div className="bg-muted/50 backdrop-blur-sm rounded-lg p-3">
              <p className="text-sm text-muted-foreground">{t("windSpeed")}</p>
              <p className="text-xl font-medium">{currentForecast.data.instant.details.wind_speed} m/s</p>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">{t("next24Hours")}</h3>
            <div className="flex overflow-x-auto pb-2 space-x-4">
              {next24HoursForecasts?.map((forecast, index) => {
                const forecastTemp = forecast.data.instant.details.air_temperature
                const displayForecastTemp = convertTemperature(forecastTemp)
                const forecastSymbol =
                  forecast.data.next_1_hours?.summary?.symbol_code ||
                  forecast.data.next_6_hours?.summary?.symbol_code ||
                  ""

                return (
                  <div key={index} className="flex flex-col items-center min-w-[60px]">
                    <p className="text-xs text-muted-foreground">{formatTime(new Date(forecast.time))}</p>
                    <div className="my-2 text-primary">{getWeatherIcon(forecastSymbol)}</div>
                    <p className="text-sm font-medium">{displayForecastTemp.toFixed(0)}°</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
