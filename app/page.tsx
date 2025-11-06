import { WeatherDisplay } from "@/components/weather-display"
import { UmbrellaRecommendation } from "@/components/umbrella-recommendation"
import { MapSelector } from "@/components/map-selector"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Top section with two columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <WeatherDisplay />
        </div>
        <div>
          <UmbrellaRecommendation />
        </div>
      </div>

      {/* Full width map selector */}
      <div className="w-full">
        <MapSelector className="rounded-xl w-full" />
      </div>
    </div>
  )
}
