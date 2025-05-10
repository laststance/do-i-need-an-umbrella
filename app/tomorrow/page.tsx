import { DetailedWeather } from "@/components/detailed-weather"

export default function TomorrowPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Tomorrow's Weather</h1>
      <DetailedWeather day="tomorrow" />
    </div>
  )
}
