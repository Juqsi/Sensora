import { useAuthStore } from '@/stores/auth'
import { toast } from 'vue-sonner'
import i18n from '@/i18n/i18n.ts'

export function handleApiError(error: any): string {
  const authStore = useAuthStore()

  const t = i18n.global?.t || ((key: string) => key)

  if (error.response) {
    const { status, data } = error.response
    let message = ''

    switch (status) {
      case 400:
        message = t('errors.badRequest', data) || data.message
        break
      case 401:
        message = t('errors.unauthorized')
        toast.error(message)
        authStore.logout()
        message = t('errors.sessionExpired')
        break
      case 403:
        message = t('errors.forbidden')
        break
      case 404:
        message = t('errors.notFound')
        break
      case 500:
        message = t('errors.serverError')
        break
      default:
        message = t('errors.unknownError') || data.message
    }

    toast.error(message)
    return message
  } else {
    const networkError = t('errors.networkError')
    toast.error(networkError)
    return networkError
  }
}
