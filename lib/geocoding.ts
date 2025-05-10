// Create a simple in-memory cache
const cache: Record<string, { data: string; timestamp: number }> = {}
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

export async function getLocationName(latitude: number, longitude: number, language = "en"): Promise<string> {
  // Create a cache key based on coordinates and language
  const cacheKey = `geocode-${latitude.toFixed(2)}-${longitude.toFixed(2)}-${language}`

  // Check if we have valid cached data
  const cachedData = cache[cacheKey]
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    return cachedData.data
  }

  try {
    const response = await fetch(`/api/geocode?lat=${latitude}&lng=${longitude}&lang=${language}`)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `Geocoding API error: ${response.status}`)
    }

    const data = await response.json()
    const locationName = data.locationName || "Unknown Location"

    // Cache the response
    cache[cacheKey] = {
      data: locationName,
      timestamp: Date.now(),
    }

    return locationName
  } catch (error) {
    console.error("Error fetching location name:", error)
    return "Unknown Location"
  }
}
