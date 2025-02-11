import { defineStore } from 'pinia'
import userApi from '@/api/userApi'
import { handleApiError } from '@/utils/apiErrorHandler'
import type { User, UserPatchBody } from '@/api'
import { toast } from 'vue-sonner'

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
      this.isLoading = true
      this.errorMessage = ''
      try {
        const response = await userApi.userPatch(data)
        this.user = response.data
        toast.success('Benutzer aktualisiert!')
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
        await userApi.userDelete()
        this.clearUserData()
        toast.success('Benutzer erfolgreich gelöscht!')
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
