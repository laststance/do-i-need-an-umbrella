"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Thermometer } from "lucide-react"
import { useUnit } from "@/components/unit-provider"
import { useTranslations } from "@/hooks/use-translations"

export function UnitSwitcher() {
  const { unit, setUnit } = useUnit()
  const t = useTranslations()

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <Thermometer className="h-5 w-5" />
                <span className="sr-only">{t("switchUnits")}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setUnit("celsius")} className={unit === "celsius" ? "bg-accent" : ""}>
                °C {t("celsius")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setUnit("fahrenheit")}
                className={unit === "fahrenheit" ? "bg-accent" : ""}
              >
                °F {t("fahrenheit")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t("switchUnits")}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
