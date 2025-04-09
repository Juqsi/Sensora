import { ref } from 'vue'
import { toast } from 'vue-sonner'
import type { Ref } from 'vue'
import type { Recognition } from '@/composables/useImageUpload.ts'
import { BASE_PATH } from '@/api/base.ts'
import i18n from '@/i18n'
import { useAuthStore } from '@/stores'

const t = i18n.global?.t || ((key: string) => key)


export function useGenerateInviteToken(apiUrl: string = BASE_PATH) {
  const isLoading: Ref<boolean> = ref(false)
  const error: Ref<string | null> = ref(null)

  const generateInviteToken = async (groupId: string): Promise<String | undefined> => {
    const toastId = toast.loading(t('group.generateInviteToken'))
    isLoading.value = true
    error.value = null

    const payload = { name }
    try {
      const response = await fetch(apiUrl +'/group/'+groupId+ '/invite', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': "Bearer " + (useAuthStore().token?? '') },
      })

      if (!response.ok) {
        throw new Error(response.statusText)
      }

      const data = await response.json()
      toast.success(t('group.generateInviteTokenFinished'), { id: toastId })
      return data.token
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('Search failed:', errorMessage)
      error.value = errorMessage
      toast.error(`Error: ${errorMessage}`, { id: toastId })
    } finally {
      isLoading.value = false
    }
  }

  return { generateInviteToken, isLoading, error }
}
