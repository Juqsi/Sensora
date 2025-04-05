<script lang="ts" setup>
import { ref } from 'vue'
import { type RecognizedImage, useImageUpload } from '@/composables/useImageUpload'
import { Button } from '@/components/ui/button'
import { TrashIcon } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { defineEmits } from 'vue'

interface ImagePreview {
  name: string
  src: string
}

const images = ref<ImagePreview[]>([])
const imageFiles = ref<File[]>([])
const { uploadImages, isUploading } = useImageUpload()

const emit = defineEmits<{ (e: 'uploadComplete', data: RecognizedImage[]): void }>()

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files) return
  const files = Array.from(input.files) as File[]
  if (files.length === 0) return
  files.forEach((file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        images.value.push({ name: file.name, src: e.target.result as string })
        imageFiles.value.push(file)
      }
    }
    reader.readAsDataURL(file)
  })
}

const removeFile = (index: number) => {
  images.value.splice(index, 1)
  imageFiles.value.splice(index, 1)
}

const submitImages = async () => {
  if (imageFiles.value.length === 0) return
  try {
    const response = await uploadImages(imageFiles.value)
    if (response) {
      toast.success('Upload erfolg  reich abgeschlossen.')
      emit('uploadComplete', response)
      images.value = []
      imageFiles.value = []
    }
  } catch (error) {
    console.error(error)
    toast.error('Fehler beim Upload.')
  }
}
</script>

<template>
  <div class="flex flex-col items-center gap-4">
    <input
      id="file-upload"
      accept="image/*"
      class="hidden"
      multiple
      type="file"
      @change="handleFileChange"
    />
    <label
      for="file-upload"
      class="cursor-pointer p-4 border border-dashed border-border rounded-xl text-muted-foreground text-center hover:bg-background transition-colors duration-200 w-full"
    >
      Select Images
    </label>
    <div v-if="images.length" class="grid grid-cols-3 gap-2">
      <div v-for="(image, index) in images" :key="index" class="relative group">
        <img
          :src="image.src"
          alt="hochgeladenes Foto"
          class="w-24 h-24 object-cover rounded-lg border border-border transition-transform duration-200 group-hover:scale-105"
        />
        <Button
          class="absolute top-1 right-1 bg-background p-1 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          size="icon"
          variant="ghost"
          @click="removeFile(index)"
        >
          <TrashIcon class="w-4 h-4 text-destructive" />
        </Button>
      </div>
    </div>
    <Button :disabled="images.length === 0 || isUploading" class="w-full" @click="submitImages">
      {{ isUploading ? 'Upload...' : 'Upload Images' }}
    </Button>
  </div>
</template>

<style scoped></style>
