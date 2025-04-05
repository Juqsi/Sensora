import { ref } from 'vue'
import { toast } from 'vue-sonner'

export const BASE_PATH = import.meta.env.VITE_PLANT_AI_BASE || ''

export interface Plant {
  plant_id: number
  common_name: string | undefined
  scientific_name: string | undefined
  cycle: string | undefined
  watering_short: string | undefined
  hardiness_zone: string | undefined
  description : string | undefined
  sun: string | undefined
  cones: string | undefined
  leaf: string | undefined
  leaf_color: string | undefined
  growth_rate: string | undefined
  care_level: string | undefined
  watering_extended: string | undefined
  sunlight_extended: string | undefined
  pruning_extended: string | undefined
}

export interface Recognition {
  name: string
  plant: Plant | null
  wikipedia: string
  probability?: number
}

export interface RecognizedImage {
  image: string
  recognitions: Recognition[]
}

function isBase64TooLarge(base64Str: string, maxFileSizeMB: number) {
  if (base64Str.includes(',')) {
    base64Str = base64Str.split(',')[1]
  }
  const sizeInBytes = Math.floor((base64Str.length * 3) / 4)
  const adjustedMaxBytes = maxFileSizeMB * 0.5 * 1024 * 1024
  return sizeInBytes > adjustedMaxBytes
}

async function compressImage(file: File, quality = 0.5, maxWidth = 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }
      const scale = Math.min(1, maxWidth / img.width)
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      const dataUrl = canvas.toDataURL('image/jpeg', quality)
      resolve(dataUrl)
    }
    img.onerror = reject

    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (!result || typeof result !== 'string') {
        reject(new Error('FileReader result is null or not a string'))
      } else {
        img.src = result
      }
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function compressBase64Image(base64Str: string, quality = 0.5, maxWidth = 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }
      const scale = Math.min(1, maxWidth / img.width)
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      const dataUrl = canvas.toDataURL('image/jpeg', quality)
      resolve(dataUrl)
    }
    img.onerror = reject
    img.src = base64Str
  })
}

export function useImageUpload(apiUrl = BASE_PATH) {
  // Entferne den plantHistory-Aufruf, da wir die Bilder nicht mehr lokal speichern
  const isUploading = ref(false)
  const error = ref<string | null>(null)
  const MAX_FILE_SIZE_MB = 5

  const uploadImages = async (imageSources: (File | string)[]):Promise<RecognizedImage[] | undefined> => {
    if (!imageSources.length) {
      toast.error('Please select images first.')
      return
    }

    let base64Images: string[]

    if (imageSources.every((source) => source instanceof File)) {
      base64Images = await Promise.all(
        imageSources.map(async (file) => {
          let base64: string
          if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            base64 = await compressImage(file)
            if (isBase64TooLarge(base64, MAX_FILE_SIZE_MB)) {
              throw new Error(`One or more images exceed the maximum file size after compression.`)
            }
          } else {
            base64 = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader()
              reader.onload = () => {
                const result = reader.result
                if (!result || typeof result !== 'string') {
                  reject(new Error('FileReader result is null or not a string'))
                } else {
                  resolve(result)
                }
              }
              reader.onerror = reject
              reader.readAsDataURL(file)
            })
            if (isBase64TooLarge(base64, MAX_FILE_SIZE_MB)) {
              base64 = await compressImage(file)
              if (isBase64TooLarge(base64, MAX_FILE_SIZE_MB)) {
                throw new Error(
                  `One or more images exceed the maximum file size after compression.`,
                )
              }
            }
          }
          return base64
        }),
      )
    } else {
      base64Images = await Promise.all(
        imageSources.map(async (base64) => {
          if (typeof base64 !== 'string') {
            throw new Error('Invalid image source format.')
          }
          if (isBase64TooLarge(base64, MAX_FILE_SIZE_MB)) {
            const compressed = await compressBase64Image(base64)
            if (isBase64TooLarge(compressed, MAX_FILE_SIZE_MB)) {
              throw new Error(
                `One or more provided images exceed the maximum file size after compression.`,
              )
            }
            return compressed
          }
          return base64
        }),
      )
    }

    const payload = { images: base64Images }
    const toastId = toast.loading('Upload image...')

    isUploading.value = true
    error.value = null

    try {
      const response = await fetch(apiUrl + '/uploads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.status === 413) {
        toast.error(`One or more images exceed the maximum file size (${MAX_FILE_SIZE_MB} MB).`, {
          id: toastId,
        })
        return
      }

      if (response.status === 400) {
        const message = await response.json()
        toast.error(message.detail, { id: toastId })
        return
      }

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`)
      }

      const data = await response.json()
      toast.success('Upload successfully completed', { id: toastId })
      return (data.results as RecognizedImage[])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown Error'
      console.error('Upload error:', errorMessage)
      error.value = errorMessage
      toast.error(`Error: ${errorMessage}`, { id: toastId })
    } finally {
      isUploading.value = false
    }
  }

  return { uploadImages, isUploading, error }
}
