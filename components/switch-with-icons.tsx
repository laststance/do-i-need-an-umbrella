"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useTranslations } from "@/hooks/use-translations"

export function SwitchWithIcons() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [isAnimating, setIsAnimating] = React.useState(false)
  const t = useTranslations()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setTheme(resolvedTheme === "dark" ? "light" : "dark")
      setTimeout(() => {
        setIsAnimating(false)
      }, 300)
    }, 150)
  }

  if (!mounted) {
    return (
      <div className="w-[56px] h-[28px] bg-white/20 rounded-full p-1 relative">
        <div className="w-6 h-6 rounded-full bg-white/50"></div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={toggleTheme}
            className={`w-[56px] h-[28px] rounded-full flex items-center p-[2px] relative transition-colors duration-500 ${
              resolvedTheme === "dark" ? "bg-blue-900/50" : "bg-blue-400/50"
            }`}
            aria-label="Toggle theme"
            disabled={isAnimating}
          >
            <span
              className={`block w-6 h-6 rounded-full transition-all duration-500 flex items-center justify-center ${
                resolvedTheme === "dark"
                  ? "translate-x-[24px] bg-blue-900 shadow-lg"
                  : "translate-x-0 bg-yellow-400 shadow-lg"
              } ${isAnimating ? "scale-110" : ""}`}
            >
              {resolvedTheme === "dark" ? (
                <Moon
                  className={`h-[14px] w-[14px] text-white transition-all duration-300 ${isAnimating ? "rotate-[360deg]" : ""}`}
                />
              ) : (
                <Sun
                  className={`h-[14px] w-[14px] text-white transition-all duration-300 ${isAnimating ? "rotate-[360deg]" : ""}`}
                />
              )}
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t("switchTheme")}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
