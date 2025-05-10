"use client"

import { useLanguage } from "@/components/language-provider"
import { translations } from "@/lib/translations"

export function useTranslations() {
  const { language } = useLanguage()

  const t = (key: keyof typeof translations.en) => {
    return translations[language][key] || translations.en[key] || key
  }

  return t
}
