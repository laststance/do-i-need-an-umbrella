import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/components/language-provider"
import { UnitProvider } from "@/components/unit-provider"
import { LocationProvider } from "@/components/location-provider"
import Header from "@/components/header"
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  title: "Do I need umbrella?",
  description: "Weather forecast information",
  manifest: "/manifest.json",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <LanguageProvider>
            <UnitProvider>
              <LocationProvider>
                <div className="flex min-h-screen flex-col">
                  <Header />
                  <main className="flex-1">{children}</main>
                </div>
              </LocationProvider>
            </UnitProvider>
          </LanguageProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}

