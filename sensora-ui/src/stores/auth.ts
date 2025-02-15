import { defineStore } from 'pinia'
import type { AuthLoginBody } from '@/api'
import { authApiClient } from '@/api'
import i18n from '@/i18n'

const t = i18n.global?.t || ((key: string) => key)

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null as string | null,
    isAuthenticated: false,
  }),
  actions: {
    async login(credentials: AuthLoginBody) {
      try {
        const response = await authApiClient.Login(credentials)
        this.token = response.data.token
        this.isAuthenticated = true
      } catch (error) {}
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
