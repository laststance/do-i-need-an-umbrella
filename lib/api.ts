import type { WeatherData } from "@/types/weather"

// Create a simple in-memory cache
const cache: Record<string, { data: WeatherData; timestamp: number }> = {}
const CACHE_DURATION = 15 * 60 * 1000 // 15 minutes in milliseconds

export async function fetchWeatherData(latitude: number, longitude: number): Promise<WeatherData> {
  // Create a cache key based on coordinates (rounded to 2 decimal places)
  const cacheKey = `weather-${latitude.toFixed(2)}-${longitude.toFixed(2)}`

  // Check if we have valid cached data
  const cachedData = cache[cacheKey]
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    return cachedData.data
  }

  try {
    const response = await fetch(`/api/weather?lat=${latitude}&lon=${longitude}`)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `Weather API error: ${response.status}`)
    }

    const data = await response.json()

    // Cache the response
    cache[cacheKey] = {
      data,
      timestamp: Date.now(),
    }

    return data
  } catch (error) {
    console.error("Error fetching weather data:", error)
    throw error
  }
}
