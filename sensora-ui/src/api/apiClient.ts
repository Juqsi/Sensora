import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { toast } from 'vue-sonner'
import i18n from '@/i18n'
import { useAuthStore } from '@/stores/auth.ts'

const t = i18n.global?.t || ((key: string) => key)

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  meta?: {
    toastId?: string | number
  }
}

const apiClient = axios.create({
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use(
  (config: CustomAxiosRequestConfig) => {
    const authStore = useAuthStore()

    config.meta = config.meta || {}
    config.meta.toastId = toast.loading(t('errors.loading'))
    const token = authStore.token
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    toast.error(t('errors.networkError'))
    return Promise.reject(error)
  },
)

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    toast.dismiss((response.config as CustomAxiosRequestConfig).meta!.toastId)
    return response
  },
  (error) => {
    const customConfig = error.config as CustomAxiosRequestConfig

    if (customConfig?.meta?.toastId) {
      toast.dismiss(customConfig.meta.toastId)
    } else {
      toast.dismiss()
    }

    if (!error.response) {
      toast.error(t('errors.networkError'))
    }

    return Promise.reject(error)
  },
)

export default apiClient
