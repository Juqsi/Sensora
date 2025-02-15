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
    toast.success(t('success.requestCompleted'), {
      id: (response.config as CustomAxiosRequestConfig).meta!.toastId,
    })

    return response
  },
  (error) => {
    const customConfig = error.config as CustomAxiosRequestConfig
    const toastId = customConfig?.meta?.toastId

    if (toastId === undefined) {
      toast.dismiss(toastId)
    }

    const errorCode = error?.response?.data?.code
    const errorMessage = errorCode
      ? t(`errors.${errorCode}`, t('errors.unknownError'))
      : t('errors.unknownError')

    toast.error(errorMessage, {
      id: toastId,
    })

    return Promise.reject(error)
  },
)

export default apiClient
