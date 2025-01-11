import './assets/index.css'
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPersist from 'pinia-plugin-persistedstate'
import { createOnyx } from 'sit-onyx'
import { createI18n } from 'vue-i18n'

//translation with i18n
import onyxDeDE from 'sit-onyx/locales/de-DE.json'
import enUS from './i18n/locales/en-US.json'
import deDE from './i18n/locales/de-DE.json'

import 'sit-onyx/style.css'
//import 'sit-onyx/global.css'
import App from './App.vue'
import router from './router'

import { getLanguage } from './composables/useLanguage'
import { useTheme } from './composables/useTheme'

const lang = getLanguage()

const i18n = createI18n({
  legacy: false,
  locale: lang,
  messages: {
    'de-DE': deDE,
    'en-US': enUS,
  },
})

const onyx = createOnyx({
  i18n: {
    locale: i18n.global.locale,
    messages: { 'de-DE': onyxDeDE },
  },
})

const app = createApp(App)

const { theme } = useTheme()
app.provide('theme', theme)

const pinia = createPinia()
pinia.use(piniaPersist)
app.use(pinia)

app.use(router)

app.use(i18n).use(onyx).mount('#app')
