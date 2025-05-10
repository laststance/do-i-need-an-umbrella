import { DetailedWeather } from "@/components/detailed-weather"

export default function TodayPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Today's Weather</h1>
      <DetailedWeather day="today" />
    </div>
  )
}
