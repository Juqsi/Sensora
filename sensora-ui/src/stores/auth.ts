import { defineStore } from 'pinia'
import authApiClient from '@/api/clients.ts'
import type { AuthLoginBody } from '@/api'
import { toast } from 'vue-sonner'
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
        toast.success(t('login.toast.success'))
      } catch (error) {
        console.error('Login fehlgeschlagen:', error)
        toast.error(t('login.toast.Failed'))
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
