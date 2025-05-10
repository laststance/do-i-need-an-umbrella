import { type NextRequest, NextResponse } from "next/server"

// Simple in-memory cache
const cache: Record<string, { data: any; timestamp: number }> = {}
const CACHE_DURATION = 15 * 60 * 1000 // 15 minutes in milliseconds

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lat = searchParams.get("lat")
  const lon = searchParams.get("lon")

  if (!lat || !lon) {
    return NextResponse.json({ error: "Latitude and longitude are required" }, { status: 400 })
  }

  // Create a cache key based on coordinates (rounded to 2 decimal places)
  const cacheKey = `weather-${Number.parseFloat(lat).toFixed(2)}-${Number.parseFloat(lon).toFixed(2)}`

  // Check if we have valid cached data
  const cachedData = cache[cacheKey]
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    return NextResponse.json(cachedData.data)
  }

  try {
    const response = await fetch(`https://api.met.no/weatherapi/locationforecast/2.0/complete?lat=${lat}&lon=${lon}`, {
      headers: {
        // Proper User-Agent is required by Met.no API
        "User-Agent": "WeatherApp/1.0 (https://weather-app.vercel.app; contact@example.com)",
      },
    })

    if (!response.ok) {
      // Handle non-JSON responses
      const text = await response.text()

      if (response.status === 429) {
        // Too many requests - return a friendly error
        return NextResponse.json(
          {
            error: "Rate limit exceeded. Please try again later.",
            details: "The weather service is currently experiencing high demand.",
          },
          { status: 429 },
        )
      }

      throw new Error(`Weather API error: ${response.status} - ${text}`)
    }

    const data = await response.json()

    // Cache the response
    cache[cacheKey] = {
      data,
      timestamp: Date.now(),
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching weather data:", error)

    // Return a user-friendly error
    return NextResponse.json(
      {
        error: "Failed to fetch weather data",
        message: "We're having trouble connecting to the weather service. Please try again later.",
      },
      { status: 500 },
    )
  }
}
