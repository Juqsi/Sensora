import './assets/index.css'
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import router from './router'

import i18n from '@/i18n'

import { useTheme } from './composables/useTheme'
import { useAuthStore } from './stores/auth'
import { useUserStore } from './stores/user'

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)

const authStore = useAuthStore()
const userStore = useUserStore()
if (authStore.token) {
  await userStore.fetchUser()
}

const { theme } = useTheme()
app.provide('theme', theme)

app.use(router)
app.use(i18n)

app.mount('#app')
