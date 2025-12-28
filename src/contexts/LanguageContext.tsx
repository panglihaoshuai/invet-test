import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { userPreferencesStorage } from '@/utils/localStorage'

type Language = 'zh' | 'en'

type LanguageContextValue = {
  language: Language
  setLanguage: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initial = (() => {
    const prefs = userPreferencesStorage.getPreferences()
    const saved = prefs?.language
    return saved === 'en' ? 'en' : 'zh'
  })()
  const [language, setLanguageState] = useState<Language>(initial)

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    userPreferencesStorage.updatePreference('language', lang)
  }

  useEffect(() => {
    const prefs = userPreferencesStorage.getPreferences()
    const saved = prefs?.language
    if (saved && (saved === 'zh' || saved === 'en') && saved !== language) {
      setLanguageState(saved)
    }
  }, [])

  const value = useMemo(() => ({ language, setLanguage }), [language])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export const useLanguage = () => {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}

