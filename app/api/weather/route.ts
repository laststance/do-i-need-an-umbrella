import { type NextRequest, NextResponse } from "next/server"
import type { WeatherData } from "@/types/weather"

// Simple in-memory cache
const cache: Record<string, { data: WeatherData; timestamp: number }> = {}
const MILLISECONDS_PER_SECOND = 1000
const SECONDS_PER_MINUTE = 60
const WEATHER_CACHE_DURATION_MINUTES = 15
const COORDINATE_CACHE_PRECISION = 2
const BAD_REQUEST_STATUS = 400
const TOO_MANY_REQUESTS_STATUS = 429
const INTERNAL_SERVER_ERROR_STATUS = 500
const CACHE_DURATION =
  WEATHER_CACHE_DURATION_MINUTES * SECONDS_PER_MINUTE * MILLISECONDS_PER_SECOND
const LOCATION_FORECAST_URL = "https://api.met.no/weatherapi/locationforecast/2.0/complete"
const GEOLOOKUP_URL = "https://api.met.no/weatherapi/geolookup/1.0/"
const MET_NO_HEADERS = {
  "User-Agent": "do-i-need-an-umbrella/0.1.0 https://github.com/laststance/do-i-need-an-umbrella",
  Accept: "application/json",
}

interface MetNoGeolookupResponse {
  name?: string
  country?: string
  region?: string
}

/**
 * Fetches weather data for coordinates and returns a cached JSON response.
 * @param request - The incoming request with `lat` and `lon` query parameters.
 * @returns
 * - HTTP 200 with Met.no weather forecast data when the upstream request succeeds.
 * - HTTP 400 when either coordinate is missing.
 * - HTTP 429 when the upstream weather service rate-limits the request.
 * - HTTP 500 when weather data cannot be fetched.
 * @example
 * await GET(new NextRequest("https://example.com/api/weather?lat=35.681236&lon=139.767125"))
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lat = searchParams.get("lat")
  const lon = searchParams.get("lon")

  if (!lat || !lon) {
    return NextResponse.json({ error: "Latitude and longitude are required" }, { status: BAD_REQUEST_STATUS })
  }

  // Create a cache key based on coordinates (rounded to 2 decimal places)
  const cacheKey = `weather-${Number.parseFloat(lat).toFixed(COORDINATE_CACHE_PRECISION)}-${Number.parseFloat(lon).toFixed(COORDINATE_CACHE_PRECISION)}`

  // Check if we have valid cached data
  const cachedData = cache[cacheKey]
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    return NextResponse.json(cachedData.data)
  }

  try {
    // First, try to get location name from Met.no's location forecast API
    const locationForecastUrl = new URL(LOCATION_FORECAST_URL)
    locationForecastUrl.search = new URLSearchParams({ lat, lon }).toString()

    const locationResponse = await fetch(locationForecastUrl, {
      headers: MET_NO_HEADERS,
    })

    if (!locationResponse.ok) {
      // Handle non-JSON responses
      const text = await locationResponse.text()

      if (locationResponse.status === TOO_MANY_REQUESTS_STATUS) {
        // Too many requests - return a friendly error
        return NextResponse.json(
          {
            error: "Rate limit exceeded. Please try again later.",
            details: "The weather service is currently experiencing high demand.",
          },
          { status: TOO_MANY_REQUESTS_STATUS },
        )
      }

      throw new Error(`Weather API error: ${locationResponse.status} - ${text}`)
    }

    const weatherData = (await locationResponse.json()) as WeatherData

    // Try to get location name from Met.no's geocoder API
    try {
      const geocodeUrl = new URL(GEOLOOKUP_URL)
      geocodeUrl.search = new URLSearchParams({ lat, lon }).toString()

      const geocodeResponse = await fetch(geocodeUrl, {
        headers: MET_NO_HEADERS,
      })

      if (geocodeResponse.ok) {
        const geocodeData = (await geocodeResponse.json()) as MetNoGeolookupResponse

        // Add location information to the weather data
        if (geocodeData && geocodeData.name) {
          weatherData.properties.location = {
            name: geocodeData.name,
            country: geocodeData.country,
            region: geocodeData.region,
          }
        }
      }
    } catch (geocodeError) {
      console.error("Error fetching location name from Met.no:", geocodeError)
      // Continue with weather data even if geocoding fails
    }

    // Cache the response
    cache[cacheKey] = {
      data: weatherData,
      timestamp: Date.now(),
    }

    return NextResponse.json(weatherData)
  } catch (error) {
    console.error("Error fetching weather data:", error)

    // Return a user-friendly error
    return NextResponse.json(
      {
        error: "Failed to fetch weather data",
        message: "We're having trouble connecting to the weather service. Please try again later.",
      },
      { status: INTERNAL_SERVER_ERROR_STATUS },
    )
  }
}
