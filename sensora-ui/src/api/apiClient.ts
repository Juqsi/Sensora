import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/auth'
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

// **Response-Interceptor mit Fehlerhandling + Toasts**
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (response.config && (response.config as CustomAxiosRequestConfig).meta?.toastId) {
      toast.dismiss((response.config as CustomAxiosRequestConfig).meta!.toastId) // Lade-Toast entfernen
    }
    return response
  },
  (error) => {
    const authStore = useAuthStore()
    const customConfig = error.config as CustomAxiosRequestConfig

    if (customConfig?.meta?.toastId) {
      toast.dismiss(customConfig.meta.toastId) // Lade-Toast entfernen
    }

    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 400:
          toast.error(data.message || 'Ungültige Anfrage!')
          break
        case 401:
          toast.error('Sitzung abgelaufen! Bitte erneut einloggen.')
          authStore.logout()
          break
        case 403:
          toast.error('Zugriff verweigert!')
          break
        case 404:
          toast.error('Ressource nicht gefunden!')
          break
        case 500:
          toast.error('Interner Serverfehler! Bitte später versuchen.')
          break
        default:
          toast.error(`Fehler: ${data.message || 'Unbekannter Fehler!'}`)
      }
    } else {
      toast.error('Netzwerkfehler! Bitte Internetverbindung prüfen.')
    }

    return Promise.reject(error)
  },
)

export default apiClient
