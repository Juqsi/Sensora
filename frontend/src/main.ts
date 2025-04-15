import './assets/index.css'
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { App as CapApp } from '@capacitor/app';
import router from './router'

import i18n from '@/i18n'

import {
  useAuthStore,
  useDeviceStore,
  useGroupStore,
  usePlantStore,
  useRoomStore,
  useUserStore,
} from '@/stores'
import App from '@/App.vue'

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)

const authStore = useAuthStore()
if (authStore.token && authStore.isAuthenticated) {
  useUserStore().fetchUser()
  useGroupStore().fetchGroups()
  usePlantStore().fetchPlants()
  useDeviceStore().fetchDevices()
  useRoomStore().fetchRooms()
} else {
  authStore.logout()
}

CapApp.addListener('appUrlOpen', (data) => {
  console.log('Empfangene URL:', data.url)
  try {
    const url = new URL(data.url)
    const path = url.pathname
    const params = Object.fromEntries(url.searchParams)
    router.push({ path, query: params })
  } catch (error) {
    console.error('Fehler beim Parsen der URL:', error)
  }
})

app.use(router)
app.use(i18n)

app.mount('#app')
