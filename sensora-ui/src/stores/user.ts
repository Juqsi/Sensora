import { defineStore } from 'pinia'
import { apiClient, BenutzerverwaltungApiFactory, type User } from '@/api'

const api = BenutzerverwaltungApiFactory(undefined, undefined, apiClient)

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null as null | User,
    lastUpdated: 0, // Timestamp für Cache
  }),
  actions: {
    async fetchUser(forceUpdate = false) {
      const now = Date.now()
      if (!forceUpdate && now - this.lastUpdated < 5 * 60 * 1000) {
        return
      }
      try {
        const response = await api.userUserIdGet('')
        this.user = response.data
        this.lastUpdated = now
      } catch (error) {
        console.error('Benutzer konnte nicht geladen werden:', error)
      }
    },
  },
})
