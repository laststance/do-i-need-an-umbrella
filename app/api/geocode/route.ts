import { type NextRequest, NextResponse } from "next/server"
import { env } from "@/env"

// Simple in-memory cache
const cache: Record<string, { data: any; timestamp: number }> = {}
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lat = searchParams.get("lat")
  const lng = searchParams.get("lng")
  const lang = searchParams.get("lang") || "en" // デフォルトは英語

  if (!lat || !lng) {
    return NextResponse.json({ error: "Latitude and longitude are required" }, { status: 400 })
  }

  // Create a cache key based on coordinates and language
  const cacheKey = `geocode-${Number.parseFloat(lat).toFixed(2)}-${Number.parseFloat(lng).toFixed(2)}-${lang}`

  // Check if we have valid cached data
  const cachedData = cache[cacheKey]
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    return NextResponse.json(cachedData.data)
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&language=${lang}&result_type=locality|administrative_area_level_1|country`,
    )

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`)
    }

    const data = await response.json()

    // Extract the most relevant location name
    let locationName = "Unknown Location"

    if (data.results && data.results.length > 0) {
      // Try to get locality (city) first
      const locality = data.results.find((result: any) => result.types.includes("locality"))

      // If no locality, try administrative area (state/province)
      const adminArea = data.results.find((result: any) => result.types.includes("administrative_area_level_1"))

      // If no admin area, try country
      const country = data.results.find((result: any) => result.types.includes("country"))

      if (locality) {
        locationName = locality.formatted_address
      } else if (adminArea) {
        locationName = adminArea.formatted_address
      } else if (country) {
        locationName = country.formatted_address
      } else if (data.results[0]) {
        locationName = data.results[0].formatted_address
      }
    }

    const result = { locationName }

    // Cache the response
    cache[cacheKey] = {
      data: result,
      timestamp: Date.now(),
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching geocoding data:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch location data",
        message: "We're having trouble determining your location name.",
      },
      { status: 500 },
    )
  }
}
