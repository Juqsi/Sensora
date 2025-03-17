import './assets/index.css'
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
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

app.use(router)
app.use(i18n)

app.mount('#app')
