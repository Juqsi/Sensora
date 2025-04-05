import { ref } from 'vue'
import { toast } from 'vue-sonner'
import type { Ref } from 'vue'
import type { Recognition } from '@/composables/useImageUpload.ts'

export const BASE_PATH = import.meta.env.VITE_PLANT_AI_BASE || ''

export function useSearch(apiUrl: string = BASE_PATH) {
  const isLoading: Ref<boolean> = ref(false)
  const error: Ref<string | null> = ref(null)

  const searchPlant = async (name: string): Promise<Recognition[] | undefined> => {
    const toastId = toast.loading('Search plant...')
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
      toast.success('Search successful!', { id: toastId })
      return data.results
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('Search failed:', errorMessage)
      error.value = errorMessage
      toast.error(`Error: ${errorMessage}`, { id: toastId })
    } finally {
      isLoading.value = false
    }
  }

  return { searchPlant, isLoading, error }
}
