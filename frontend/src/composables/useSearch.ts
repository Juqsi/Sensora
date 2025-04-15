import { ref } from 'vue'
import { toast } from 'vue-sonner'
import type { Ref } from 'vue'
import type { Recognition } from '@/composables/useImageUpload.ts'
import i18n from '@/i18n'

const t = i18n.global?.t || ((key: string) => key)

export const BASE_PATH = import.meta.env.VITE_PLANT_AI_BASE || ''

export function useSearch(apiUrl: string = BASE_PATH) {
  const isLoading: Ref<boolean> = ref(false)
  const error: Ref<string | null> = ref(null)

  const searchPlant = async (name: string): Promise<Recognition[] | undefined> => {
    const toastId = toast.loading(t('PlantSearch.isSearching'),{duration:500})
    isLoading.value = true
    error.value = null

    const payload = { name }
    try {
      const response = await fetch(apiUrl + '/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`)
      }

      const data = await response.json()
      toast.success(t('PlantSearch.Success'), { id: toastId })
      return data.results
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error(t('PlantSearch.SearchError'), errorMessage)
      error.value = errorMessage
      toast.error(`${t('PlantSearch.SearchError')}: ${errorMessage}`, { id: toastId })
    } finally {
      isLoading.value = false
    }
  }

  return { searchPlant, isLoading, error }
}
