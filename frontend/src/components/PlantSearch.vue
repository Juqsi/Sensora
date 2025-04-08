<script lang="ts" setup>
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'
import { defineEmits } from 'vue'
import type { RecognizedImage } from '@/composables/useImageUpload.ts'
import { useSearch } from '@/composables/useSearch.ts'

const { searchPlant, isLoading } = useSearch()
const { t } = useI18n()
const searchQuery = ref<string>('')

const emit = defineEmits<{ (e: 'searchResults', results: RecognizedImage[]): void }>()

const performSearch = async () => {
  if (searchQuery.value && searchQuery.value.trim() !== '') {
    const results = await searchPlant(searchQuery.value) ?? []
    if (results.length > 0) {
      const tmp: RecognizedImage[] = [{ image: "", recognitions: results }]
      emit('searchResults', tmp)
    } else {
      toast.info(t('PlantSearch.noResults'))
    }
  }
}
</script>

<template>
  <div class="flex flex-col items-center gap-4 pt-2 max-w-md mx-auto">
    <input
      id="search"
      type="text"
      v-model="searchQuery"
      :placeholder="t('PlantSearch.Search')"
      class="w-full rounded-md h-10 border border-border px-3 py-6 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
    />

    <Button @click="performSearch" class="w-full">
      {{ isLoading ? t('PlantSearch.isSearching') : t('PlantSearch.searchButton') }}
    </Button>
  </div>
</template>

<style scoped></style>
