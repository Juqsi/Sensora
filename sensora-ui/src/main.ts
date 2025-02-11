import './assets/index.css'
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPersist from 'pinia-plugin-persistedstate'
import App from './App.vue'
import router from './router'

import i18n from './i18n/i18n.ts'

import { useTheme } from './composables/useTheme'
import { useAuthStore } from '@/stores/auth'

import { useUserStore } from '@/stores/user'

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPersist)
app.use(pinia)

const authStore = useAuthStore()
const userStore = useUserStore()
if (authStore.token) {
  userStore.fetchUser()
}

const { theme } = useTheme()
app.provide('theme', theme)

app.use(router)
app.use(i18n)

app.mount('#app')
