import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { toast } from 'vue-sonner'

// **Erweitertes Interface für Axios-Config (mit meta)**
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  meta?: {
    toastId?: string | number
  }
}

const apiClient = axios.create({
  headers: { 'Content-Type': 'application/json' },
})

// **Request-Interceptor: Lade-Toast anzeigen**
apiClient.interceptors.request.use(
  (config: CustomAxiosRequestConfig) => {
    config.meta = config.meta || {} // Falls meta nicht existiert, initialisieren
    config.meta.toastId = toast.loading('Lädt...')
    return config
  },
  (error) => Promise.reject(error),
)

// **Response-Interceptor mit Fehlerhandling**
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (response.config && (response.config as CustomAxiosRequestConfig).meta?.toastId) {
      toast.dismiss((response.config as CustomAxiosRequestConfig).meta!.toastId) // Lade-Toast entfernen
    }
    return response
  },
  (error) => {
    const customConfig = error.config as CustomAxiosRequestConfig

    if (customConfig?.meta?.toastId) {
      toast.dismiss(customConfig.meta.toastId) // Lade-Toast entfernen
    }

    // Keine spezifischen Fehler-Toasts hier → das macht der Store
    return Promise.reject(error)
  },
)

export default apiClient
