import { defineStore } from 'pinia'
import authApi from '@/api/authApi'
import type { AuthLoginBody } from '@/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null as string | null,
    isAuthenticated: false,
  }),
  actions: {
    async login(credentials: AuthLoginBody) {
      try {
        const response = await authApi.authLoginPost(credentials)
        this.token = response.data.token
        this.isAuthenticated = true
      } catch (error) {
        console.error('Login fehlgeschlagen:', error)
      }
    },
    logout() {
      console.log('logout')
      /*
                        this.token = null
                                                      this.isAuthenticated = false
                                                      const userStore = useUserStore()
                                                                  const deviceStore = useDeviceStore()
                                                                  const plantStore = usePlantStore()
                                                                  const roomStore = useRoomStore()
                                                                  const groupStore = useGroupStore()
                                                                  userStore.clearData()
                                                                 deviceStore.clearData()
              plantStore.clearData()
               roomStore.clearData()
               groupStore.clearData()
            */
    },
  },
  persist: {
    storage: localStorage,
  },
})
