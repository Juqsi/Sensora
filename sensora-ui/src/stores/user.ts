import { defineStore } from 'pinia'
import userApi from '@/api/userApi'
import { handleApiError } from '@/utils/apiErrorHandler'
import type { User, UserPatchBody } from '@/api'
import { toast } from 'vue-sonner'
import { useI18n } from 'vue-i18n'

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
        const response = await userApi.userUserIdGet(userId || '')
        this.user = response.data
      } catch (error) {
        this.errorMessage = handleApiError(error)
        toast.error(this.errorMessage)
      } finally {
        this.isLoading = false
      }
    },

    async updateUser(data: UserPatchBody) {
      const { t } = useI18n()
      this.isLoading = true
      this.errorMessage = ''
      try {
        const response = await userApi.userPatch(data)
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
      const { t } = useI18n()
      this.isLoading = true
      this.errorMessage = ''
      try {
        await userApi.userDelete()
        this.clearUserData()
        toast.success(t('user.deleted'))
      } catch (error) {
        this.errorMessage = handleApiError(error)
        toast.error(this.errorMessage)
      } finally {
        this.isLoading = false
      }
    },

    clearUserData() {
      this.user = null
    },
  },
})
