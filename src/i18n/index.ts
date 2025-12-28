import { useLanguage } from '@/contexts/LanguageContext'
import { dict, Language } from './dict'

export const useT = () => {
  const { language } = useLanguage()
  const t = (key: keyof typeof dict) => dict[key]?.[language] ?? dict[key]?.zh ?? String(key)
  return t
}

export const tByLang = (lang: Language) => (key: keyof typeof dict) => dict[key]?.[lang] ?? dict[key]?.zh ?? String(key)

