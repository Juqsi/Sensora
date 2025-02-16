import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { toast } from 'vue-sonner'
import i18n from '@/i18n'
import { useAuthStore } from '@/stores/auth.ts'

const t = i18n.global?.t || ((key: string) => key)

export interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  meta?: {
    toastId?: string | number
    successMessage?: string
    errorMessage?: string
  }
}

const apiClient = axios.create({
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use(
  (config: CustomAxiosRequestConfig) => {
    const authStore = useAuthStore()

    // Sicherstellen, dass headers existiert
    config.headers = config.headers || {}

    // Meta-Objekt initialisieren
    config.meta = config.meta || {}

    // Lade-Toast anzeigen
    config.meta.toastId = toast.loading(t('errors.loading'))

    // Token hinzufügen, falls vorhanden
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
    const customConfig = response.config as CustomAxiosRequestConfig
    if (customConfig?.meta?.toastId) {
      toast.dismiss(customConfig.meta.toastId)
    }

    const successMessage = customConfig?.meta?.successMessage || t('success.requestCompleted')

    toast.success(successMessage)

    return response
  },
  (error) => {
    const customConfig = error.config as CustomAxiosRequestConfig
    const toastId = customConfig?.meta?.toastId

    if (toastId === undefined) {
      toast.dismiss(toastId)
    }

    const errorCode = error?.response?.data?.code
    let errorMessage = errorCode
    const defaultErrorMessage = errorCode
      ? t(`errors.${errorCode}`, t('errors.unknownError'))
      : t('errors.unknownError')

    errorMessage = customConfig?.meta?.errorMessage || defaultErrorMessage

    toast.error(errorMessage, {
      id: toastId,
    })

    return Promise.reject(error)
  },
)

export default apiClient
