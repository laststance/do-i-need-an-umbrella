import { WeatherDisplay } from "@/components/weather-display"
import { UmbrellaRecommendation } from "@/components/umbrella-recommendation"
import { MapSelector } from "@/components/map-selector"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <WeatherDisplay />
          <MapSelector className="h-[350px] mt-6 rounded-xl overflow-hidden w-full" />
        </div>
        <div>
          <UmbrellaRecommendation className="mb-6" />
        </div>
      </div>
    </div>
  )
}
