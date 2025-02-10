import { defineStore } from 'pinia'
import authApi from '@/api/authApi'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
  }),
  actions: {
    async login(credentials: { email: string; password: string }) {
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
      //TODO remove all stored data from other stores
    },
  },
})
