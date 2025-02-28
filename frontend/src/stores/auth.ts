import { defineStore } from 'pinia'
import type { AuthLoginBody, AuthResponse } from '@/api'
import { authApiClient } from '@/api'
import i18n from '@/i18n'
import type { CustomAxiosRequestConfig } from '@/api/apiClient.ts'
import { useDeviceStore, useGroupStore, usePlantStore, useRoomStore, useUserStore } from '@/stores'
import type { AxiosResponse } from 'axios'

const t = i18n.global?.t || ((key: string) => key)

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null as string | null,
    isAuthenticated: false,
  }),
  actions: {
    async login(credentials: AuthLoginBody) {
      try {
        const response: AxiosResponse<AuthResponse> = await authApiClient.Login(credentials, {
          meta: {
            successMessage: t('login.Success'),
          },
        } as CustomAxiosRequestConfig)
        this.token = response.data.token
        const userStore = useUserStore()
        userStore.fullUser = response.data
        userStore.user = {
          uid: response.data.uid,
          username: response.data.username,
          mail: response.data.mail,
          avatarRef: response.data.avatarRef,
          firstname: response.data.firstname,
          groupIds: response.data.groupIds,
          lastname: response.data.lastname,
        }
        this.isAuthenticated = true
      } catch (error) {}
    },
    logout() {
      console.log('logout')
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
    },
  },
  persist: {
    storage: localStorage,
  },
})
