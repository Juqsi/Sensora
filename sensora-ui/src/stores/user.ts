import { defineStore } from 'pinia'
import { handleApiError } from '@/utils/apiErrorHandler'
import type { updateUserBody, User } from '@/api'
import { userApiClient } from '@/api'
import { toast } from 'vue-sonner'
import i18n from '@/i18n'

const t = i18n.global?.t || ((key: string) => key)

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null as User | null,
    isLoading: false,
    errorMessage: '',
  }),
  actions: {
    async fetchUser(userId?: string, force = false) {
      if (!force && this.user) return

      this.isLoading = true
      this.errorMessage = ''
      try {
        const response = await userApiClient.get(userId || '')
        this.user = response.data
      } catch (error) {
        this.errorMessage = handleApiError(error)
        toast.error(this.errorMessage)
      } finally {
        this.isLoading = false
      }
    },

    async updateUser(data: updateUserBody) {
      this.isLoading = true
      this.errorMessage = ''
      try {
        const response = await userApiClient.update(data)
        this.user = response.data
        toast.success(t('user.updated'))
      } catch (error) {
        this.errorMessage = handleApiError(error)
        toast.error(this.errorMessage)
      } finally {
        this.isLoading = false
      }
    },

    async deleteUser() {
      this.isLoading = true
      this.errorMessage = ''
      try {
        await userApiClient.delete()
        this.clearData()
        toast.success(t('user.deleted'))
      } catch (error) {
        this.errorMessage = handleApiError(error)
        toast.error(this.errorMessage)
      } finally {
        this.isLoading = false
      }
    },

    clearData() {
      this.user = null
    },
  },
  persist: {
    storage: localStorage,
  },
})
