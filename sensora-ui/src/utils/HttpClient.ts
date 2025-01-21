import type { AxiosInstance } from 'axios'
import axios, { AxiosError, type AxiosRequestConfig } from 'axios'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'

const { t } = useI18n()

class HttpClient {
  private client: AxiosInstance

  constructor(baseURL: string) {
    this.client = axios.create({ baseURL })

    // Interceptor für Antworten
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        // Fehler abfangen und Toast anzeigen
        this.handleError(error)
        return Promise.reject(error)
      },
    )
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config)
    return response.data
  }

  async post<T>(url: string, data: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config)
    return response.data
  }

  async patch<T>(url: string, data: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config)
    return response.data
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config)
    return response.data
  }

  private handleError(error: AxiosError): void {
    if (error.response) {
      const status = error.response.status
      const message = this.getErrorMessage(status)

      // Toast-Benachrichtigung anzeigen
      toast.error({
        title: `Fehler: ${status}`,
        description: message,
      })
    } else {
      // Fallback für unbekannte Fehler
      toast.error({
        title: t('error.unknown'),
        description: 'Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
      })
    }
  }

  private getErrorMessage(status: number): string {
    switch (status) {
      case 400:
        return t('error.bad_request')
      case 401:
        return t('error.unauthorized')
      case 403:
        return t('error.forbidden')
      case 404:
        return t('error.not_found')
      case 500:
        return t('error.server_error')
      default:
        return t('error.unknown')
    }
  }
}

export default new HttpClient('https://api.maxtar.de/v1')
