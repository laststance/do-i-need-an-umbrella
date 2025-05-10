"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/language-switcher"
import { UnitSwitcher } from "@/components/unit-switcher"
import { SwitchWithIcons } from "@/components/switch-with-icons"
import { Menu, X, Home, Calendar, Sun, Umbrella } from "lucide-react"
import { useTranslations } from "@/hooks/use-translations"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const t = useTranslations()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const navItems = [
    { href: "/", label: t("home"), icon: Home },
    { href: "/today", label: t("today"), icon: Sun },
    { href: "/tomorrow", label: t("tomorrow"), icon: Calendar },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 header-glass rounded-2xl mx-2 mt-2">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Umbrella className="h-8 w-8 text-white" />
              <span className="font-bold text-lg hidden md:inline-block text-white">{t("appName")}</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md flex items-center space-x-1 transition-colors text-white ${
                    pathname === item.href ? "bg-white/20" : "hover:bg-white/10"
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="hidden md:flex items-center space-x-2">
            <SwitchWithIcons />
            <LanguageSwitcher />
            <UnitSwitcher />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              className="text-white hover:bg-white/10"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-3 py-2 rounded-md flex items-center space-x-2 text-white ${
                    pathname === item.href ? "bg-white/20" : "hover:bg-white/10"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
            <div className="flex items-center space-x-2 pt-4 border-t border-white/20 mt-4">
              <SwitchWithIcons />
              <LanguageSwitcher />
              <UnitSwitcher />
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
