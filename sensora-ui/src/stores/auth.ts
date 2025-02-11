import { defineStore } from 'pinia'
import authApi from '@/api/authApi'
import type { AuthLoginBody } from '@/api'
import { useDeviceStore } from '@/stores/device.ts'
import { useGroupStore } from '@/stores/group.ts'
import { useUserStore } from '@/stores/user.ts'
import { usePlantStore } from '@/stores/plant.ts'
import { useRoomStore } from '@/stores/room.ts'

const userStore = useUserStore()
const deviceStore = useDeviceStore()
const plantStore = usePlantStore()
const roomStore = useRoomStore()
const groupStore = useGroupStore()

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
  }),
  actions: {
    async login(credentials: AuthLoginBody) {
      try {
        const response = await authApi.authLoginPost(credentials)
        this.token = response.data.token
        localStorage.setItem('token', this.token!)
        this.isAuthenticated = true
      } catch (error) {
        console.error('Login fehlgeschlagen:', error)
      }
    },
    logout() {
      this.token = null
      localStorage.removeItem('token')
      this.isAuthenticated = false
      userStore.clearData()
      deviceStore.clearData()
      plantStore.clearData()
      roomStore.clearData()
      groupStore.clearData()
    },
  },
})
