"use client"

import { DetailedWeather } from "@/components/detailed-weather"
import { useLocation } from "@/components/location-provider"
import { MapPin } from "lucide-react"
import { useTranslations } from "@/hooks/use-translations"

export default function TodayPage() {
  const { locationName, isLoadingLocationName } = useLocation()
  const t = useTranslations()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        {t("todaysWeather")}
        {!isLoadingLocationName && (
          <span className="ml-2 text-lg font-normal flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            {locationName}
          </span>
        )}
      </h1>
      <DetailedWeather day="today" />
    </div>
  )
}
