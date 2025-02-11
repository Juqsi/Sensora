import { toast } from 'vue-sonner'
import { useAuthStore } from '@/stores/auth'

export function handleApiError(error: any) {
  const authStore = useAuthStore()

  if (error.response) {
    const { status, data } = error.response

    switch (status) {
      case 400:
        return data.message || 'Ungültige Anfrage!'
      case 401:
        toast.error('Sitzung abgelaufen! Bitte erneut einloggen.')
        authStore.logout()
        return 'Nicht autorisiert!'
      case 403:
        return 'Zugriff verweigert!'
      case 404:
        return 'Ressource nicht gefunden!'
      case 500:
        return 'Interner Serverfehler! Bitte später versuchen.'
      default:
        return data.message || 'Unbekannter Fehler!'
    }
  } else {
    return 'Netzwerkfehler! Bitte Internetverbindung prüfen.'
  }
}
