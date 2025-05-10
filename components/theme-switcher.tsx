"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { useTranslations } from "@/hooks/use-translations"
import { useEffect, useState } from "react"

export function ThemeSwitcher() {
  const { resolvedTheme, setTheme } = useTheme()
  const t = useTranslations()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Toggle theme function
  const toggleTheme = () => {
    console.log("Current theme:", resolvedTheme)
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  // Show placeholder during SSR
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 w-9 h-9 relative">
        <span className="sr-only">{t("switchTheme")}</span>
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="text-white hover:bg-white/10 w-9 h-9 relative"
      aria-label={t("switchTheme")}
    >
      <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300">
        {resolvedTheme === "dark" ? (
          <Sun className="h-5 w-5 transition-transform duration-300" />
        ) : (
          <Moon className="h-5 w-5 transition-transform duration-300" />
        )}
      </div>
      <span className="sr-only">{t("switchTheme")}</span>
    </Button>
  )
}
