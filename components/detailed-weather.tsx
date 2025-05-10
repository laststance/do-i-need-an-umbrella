"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useLocation } from "@/components/location-provider"
import { useUnit } from "@/components/unit-provider"
import { useTranslations } from "@/hooks/use-translations"
import { fetchWeatherData } from "@/lib/api"
import type { WeatherData } from "@/types/weather"
import { formatDate, formatTime, getDayStart, getDayEnd, addDays } from "@/lib/date-utils"
import { Cloud, CloudRain, Sun, CloudSun, CloudFog, CloudSnow, Wind, Droplets, Sunrise, Sunset } from "lucide-react"

interface DetailedWeatherProps {
  day: "today" | "tomorrow"
}

export function DetailedWeather({ day }: DetailedWeatherProps) {
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

  if (isLoading || locationLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <div className="p-4 text-center">
            <p className="text-red-500">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!weatherData) {
    return (
      <Card>
        <CardContent>
          <div className="p-4 text-center">
            <p>{t("noWeatherData")}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Get the date for the selected day
  const today = new Date()
  const targetDate = day === "today" ? today : addDays(today, 1)
  const dayStart = getDayStart(targetDate)
  const dayEnd = getDayEnd(targetDate)

  // Filter forecasts for the selected day
  const dayForecasts = weatherData.properties.timeseries.filter((forecast) => {
    const forecastDate = new Date(forecast.time)
    return forecastDate >= dayStart && forecastDate <= dayEnd
  })

  if (dayForecasts.length === 0) {
    return (
      <Card>
        <CardContent>
          <div className="p-4 text-center">
            <p>{t("noForecastData")}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Get the first forecast of the day for summary
  const firstForecast = dayForecasts[0]
  const morningForecast =
    dayForecasts.find((f) => {
      const hour = new Date(f.time).getHours()
      return hour >= 8 && hour <= 10
    }) || firstForecast

  const noonForecast =
    dayForecasts.find((f) => {
      const hour = new Date(f.time).getHours()
      return hour >= 12 && hour <= 14
    }) || firstForecast

  const eveningForecast =
    dayForecasts.find((f) => {
      const hour = new Date(f.time).getHours()
      return hour >= 18 && hour <= 20
    }) || firstForecast

  // Calculate min and max temperature for the day
  const temperatures = dayForecasts.map((f) => f.data.instant.details.air_temperature)
  const minTemp = Math.min(...temperatures)
  const maxTemp = Math.max(...temperatures)

  // Get weather symbol
  const getWeatherIcon = (symbol: string, size = 24) => {
    if (!symbol) return <Sun size={size} />

    if (symbol.includes("rain")) return <CloudRain size={size} />
    if (symbol.includes("cloud")) {
      if (symbol.includes("sun")) return <CloudSun size={size} />
      return <Cloud size={size} />
    }
    if (symbol.includes("fog")) return <CloudFog size={size} />
    if (symbol.includes("snow")) return <CloudSnow size={size} />
    if (symbol.includes("wind")) return <Wind size={size} />

    return <Sun size={size} />
  }

  // Get precipitation probability (estimated from symbol code)
  const getPrecipitationProbability = (symbol: string) => {
    if (!symbol) return 0
    if (symbol.includes("rain_shower")) return 60
    if (symbol.includes("rain")) return 80
    if (symbol.includes("drizzle")) return 40
    if (symbol.includes("cloud")) return 20
    return 0
  }

  // Get sunrise/sunset times (approximated since the API doesn't provide this)
  // In a real app, you would use a library like SunCalc or fetch from another API
  const getSunriseSunsetTimes = (date: Date) => {
    // This is a very rough approximation
    const newDate = new Date(date)
    return {
      sunrise: new Date(newDate.setHours(6, 30, 0, 0)),
      sunset: new Date(newDate.setHours(18, 30, 0, 0)),
    }
  }

  const { sunrise, sunset } = getSunriseSunsetTimes(new Date(targetDate))

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {formatDate(targetDate)} {t("summary")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center">
                <div className="text-5xl text-primary mr-4">
                  {getWeatherIcon(
                    firstForecast.data.next_6_hours?.summary?.symbol_code ||
                      firstForecast.data.next_1_hours?.summary?.symbol_code ||
                      "",
                    48,
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("temperature")}</p>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold">
                      {convertTemperature(noonForecast.data.instant.details.air_temperature).toFixed(1)}°
                    </span>
                    <span className="text-sm ml-1">{unit === "celsius" ? "C" : "F"}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <span className="mr-2">{t("minMax")}:</span>
                    <span>
                      {convertTemperature(minTemp).toFixed(0)}° / {convertTemperature(maxTemp).toFixed(0)}°
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center mb-1">
                    <Droplets className="h-4 w-4 mr-1 text-blue-500" />
                    <p className="text-sm text-muted-foreground">{t("humidity")}</p>
                  </div>
                  <p className="text-xl font-medium">{noonForecast.data.instant.details.relative_humidity}%</p>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center mb-1">
                    <Wind className="h-4 w-4 mr-1 text-gray-500" />
                    <p className="text-sm text-muted-foreground">{t("windSpeed")}</p>
                  </div>
                  <p className="text-xl font-medium">{noonForecast.data.instant.details.wind_speed} m/s</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center mb-1">
                    <Sunrise className="h-4 w-4 mr-1 text-yellow-500" />
                    <p className="text-sm text-muted-foreground">{t("sunrise")}</p>
                  </div>
                  <p className="text-xl font-medium">{formatTime(sunrise)}</p>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center mb-1">
                    <Sunset className="h-4 w-4 mr-1 text-orange-500" />
                    <p className="text-sm text-muted-foreground">{t("sunset")}</p>
                  </div>
                  <p className="text-xl font-medium">{formatTime(sunset)}</p>
                </div>
              </div>

              <div className="bg-muted rounded-lg p-3">
                <div className="flex items-center mb-1">
                  <CloudRain className="h-4 w-4 mr-1 text-blue-500" />
                  <p className="text-sm text-muted-foreground">{t("precipitation")}</p>
                </div>
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                    <div
                      className="bg-blue-500 h-2.5 rounded-full"
                      style={{
                        width: `${getPrecipitationProbability(
                          firstForecast.data.next_6_hours?.summary?.symbol_code ||
                            firstForecast.data.next_1_hours?.summary?.symbol_code ||
                            "",
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm">
                    {getPrecipitationProbability(
                      firstForecast.data.next_6_hours?.summary?.symbol_code ||
                        firstForecast.data.next_1_hours?.summary?.symbol_code ||
                        "",
                    )}
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("hourlyForecast")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left">{t("time")}</th>
                    <th className="px-4 py-2 text-left">{t("condition")}</th>
                    <th className="px-4 py-2 text-left">{t("temperature")}</th>
                    <th className="px-4 py-2 text-left">{t("precipitation")}</th>
                    <th className="px-4 py-2 text-left">{t("humidity")}</th>
                    <th className="px-4 py-2 text-left">{t("windSpeed")}</th>
                  </tr>
                </thead>
                <tbody>
                  {dayForecasts.map((forecast, index) => {
                    const forecastTime = new Date(forecast.time)
                    const symbol =
                      forecast.data.next_1_hours?.summary?.symbol_code ||
                      forecast.data.next_6_hours?.summary?.symbol_code ||
                      ""

                    return (
                      <tr key={index} className={index % 2 === 0 ? "bg-muted/50" : ""}>
                        <td className="px-4 py-2">{formatTime(forecastTime)}</td>
                        <td className="px-4 py-2">
                          <div className="flex items-center">
                            {getWeatherIcon(symbol)}
                            <span className="ml-2">{symbol.split("_").join(" ")}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          {convertTemperature(forecast.data.instant.details.air_temperature).toFixed(1)}°
                          {unit === "celsius" ? "C" : "F"}
                        </td>
                        <td className="px-4 py-2">{getPrecipitationProbability(symbol)}%</td>
                        <td className="px-4 py-2">{forecast.data.instant.details.relative_humidity}%</td>
                        <td className="px-4 py-2">{forecast.data.instant.details.wind_speed} m/s</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("dayParts")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="morning">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="morning">{t("morning")}</TabsTrigger>
              <TabsTrigger value="afternoon">{t("afternoon")}</TabsTrigger>
              <TabsTrigger value="evening">{t("evening")}</TabsTrigger>
            </TabsList>
            <TabsContent value="morning" className="p-4">
              <div className="flex items-center space-x-4">
                <div className="text-4xl text-primary">
                  {getWeatherIcon(
                    morningForecast.data.next_1_hours?.summary?.symbol_code ||
                      morningForecast.data.next_6_hours?.summary?.symbol_code ||
                      "",
                    40,
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-medium">{t("morningForecast")}</h3>
                  <p className="text-2xl font-bold">
                    {convertTemperature(morningForecast.data.instant.details.air_temperature).toFixed(1)}°
                    {unit === "celsius" ? "C" : "F"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("feelsLike")}{" "}
                    {convertTemperature(morningForecast.data.instant.details.air_temperature).toFixed(1)}°
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-sm text-muted-foreground">{t("humidity")}</p>
                  <p className="text-lg font-medium">{morningForecast.data.instant.details.relative_humidity}%</p>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-sm text-muted-foreground">{t("windSpeed")}</p>
                  <p className="text-lg font-medium">{morningForecast.data.instant.details.wind_speed} m/s</p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="afternoon" className="p-4">
              <div className="flex items-center space-x-4">
                <div className="text-4xl text-primary">
                  {getWeatherIcon(
                    noonForecast.data.next_1_hours?.summary?.symbol_code ||
                      noonForecast.data.next_6_hours?.summary?.symbol_code ||
                      "",
                    40,
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-medium">{t("afternoonForecast")}</h3>
                  <p className="text-2xl font-bold">
                    {convertTemperature(noonForecast.data.instant.details.air_temperature).toFixed(1)}°
                    {unit === "celsius" ? "C" : "F"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("feelsLike")} {convertTemperature(noonForecast.data.instant.details.air_temperature).toFixed(1)}°
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-sm text-muted-foreground">{t("humidity")}</p>
                  <p className="text-lg font-medium">{noonForecast.data.instant.details.relative_humidity}%</p>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-sm text-muted-foreground">{t("windSpeed")}</p>
                  <p className="text-lg font-medium">{noonForecast.data.instant.details.wind_speed} m/s</p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="evening" className="p-4">
              <div className="flex items-center space-x-4">
                <div className="text-4xl text-primary">
                  {getWeatherIcon(
                    eveningForecast.data.next_1_hours?.summary?.symbol_code ||
                      eveningForecast.data.next_6_hours?.summary?.symbol_code ||
                      "",
                    40,
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-medium">{t("eveningForecast")}</h3>
                  <p className="text-2xl font-bold">
                    {convertTemperature(eveningForecast.data.instant.details.air_temperature).toFixed(1)}°
                    {unit === "celsius" ? "C" : "F"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("feelsLike")}{" "}
                    {convertTemperature(eveningForecast.data.instant.details.air_temperature).toFixed(1)}°
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-sm text-muted-foreground">{t("humidity")}</p>
                  <p className="text-lg font-medium">{eveningForecast.data.instant.details.relative_humidity}%</p>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-sm text-muted-foreground">{t("windSpeed")}</p>
                  <p className="text-lg font-medium">{eveningForecast.data.instant.details.wind_speed} m/s</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
