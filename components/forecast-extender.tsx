"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { useTranslations } from "@/hooks/use-translations"
import Link from "next/link"

interface ForecastExtenderProps {
  className?: string
}

export function ForecastExtender({ className }: ForecastExtenderProps) {
  const [days, setDays] = useState(1)
  const t = useTranslations()

  const handleSliderChange = (value: number[]) => {
    setDays(value[0])
  }

  return (
    <Card className={`card-gradient ${className}`}>
      <CardHeader>
        <CardTitle>{t("extendForecast")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">
                {t("forecastDays")}: {days}
              </span>
              <span className="text-sm text-muted-foreground">{t("maxDays")}: 7</span>
            </div>
            <Slider defaultValue={[1]} max={7} step={1} onValueChange={handleSliderChange} />
          </div>

          <div className="flex flex-col space-y-2">
            <Link href="/today">
              <Button variant="outline" className="w-full justify-start">
                {t("viewTodayForecast")}
              </Button>
            </Link>
            <Link href="/tomorrow">
              <Button variant="outline" className="w-full justify-start">
                {t("viewTomorrowForecast")}
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
