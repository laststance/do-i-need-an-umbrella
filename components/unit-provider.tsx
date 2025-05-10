"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type TemperatureUnit = "celsius" | "fahrenheit"

interface UnitContextType {
  unit: TemperatureUnit
  setUnit: (unit: TemperatureUnit) => void
  convertTemperature: (celsius: number) => number
}

const UnitContext = createContext<UnitContextType | undefined>(undefined)

export function UnitProvider({ children }: { children: ReactNode }) {
  const [unit, setUnit] = useState<TemperatureUnit>("celsius")

  useEffect(() => {
    const storedUnit = localStorage.getItem("temperatureUnit") as TemperatureUnit | null
    if (storedUnit) {
      setUnit(storedUnit)
    }
  }, [])

  const handleSetUnit = (newUnit: TemperatureUnit) => {
    setUnit(newUnit)
    localStorage.setItem("temperatureUnit", newUnit)
  }

  const convertTemperature = (celsius: number): number => {
    if (unit === "celsius") return celsius
    return (celsius * 9) / 5 + 32
  }

  return (
    <UnitContext.Provider value={{ unit, setUnit: handleSetUnit, convertTemperature }}>{children}</UnitContext.Provider>
  )
}

export function useUnit() {
  const context = useContext(UnitContext)
  if (context === undefined) {
    throw new Error("useUnit must be used within a UnitProvider")
  }
  return context
}
