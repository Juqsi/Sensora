import { createI18n } from 'vue-i18n'
import enUS from './locales/en-US.json'
import deDE from './locales/de-DE.json'
import { getLanguage } from '../composables/useLanguage.ts'

const lang = getLanguage()

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: lang,
  fallbackLocale: 'en-US',
  messages: {
    'de-DE': deDE,
    'en-US': enUS,
  },
})

export default i18n
