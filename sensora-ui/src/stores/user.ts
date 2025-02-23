import { defineStore } from 'pinia'
import type { AuthResponse, updateUserBody, User } from '@/api'
import { userApiClient } from '@/api'
import i18n from '@/i18n'
import type { CustomAxiosRequestConfig } from '@/api/apiClient.ts'

const t = i18n.global?.t || ((key: string) => key)

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null as User | null,
    fullUser: null as AuthResponse | null,
  }),
  actions: {
    async fetchUser(userId?: string, force = false) {
      if (!force && this.user) return

      const response = await userApiClient.get(userId || '')
      this.user = response.data
    },

    async updateUser(data: updateUserBody) {
      const response = await userApiClient.update(data, {
        meta: {
          successMessage: t('user.updated'),
        },
      } as CustomAxiosRequestConfig)
      this.user = response.data as User
    },

    async deleteUser() {
      await userApiClient.delete({
        meta: { successMessage: t('user.deleted') },
      } as CustomAxiosRequestConfig)
      this.clearData()
    },

    clearData() {
      this.user = null
    },
  },
  persist: {
    storage: localStorage,
  },
})
