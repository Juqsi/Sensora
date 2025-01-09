import './assets/index.css'
//import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createOnyx } from 'sit-onyx'
import { createI18n } from 'vue-i18n'

//translation with i18n
import onyxDeDE from 'sit-onyx/locales/de-DE.json'
import enUS from './i18n/locales/en-US.json'
import deDE from './i18n/locales/de-DE.json'

//import 'sit-onyx/style.css'
//import 'sit-onyx/global.css'
import App from './App.vue'
import router from './router'

const i18n = createI18n({
  legacy: false,
  locale: 'de-DE', // Standardsprache
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

app.use(createPinia())
app.use(router)

app.use(i18n).use(onyx).mount('#app')
