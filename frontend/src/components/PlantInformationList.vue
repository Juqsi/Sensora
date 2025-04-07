<script lang="ts" setup>
import { defineProps, defineEmits, computed } from 'vue'
import PlantInformationCard from '@/components/PlantInformationCard.vue'
import type { Plant, RecognizedImage } from '@/composables/useImageUpload.ts'
import EmtyState from '@/components/EmtyState.vue'
import {useI18n} from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{ plants: RecognizedImage [] }>()
const emit = defineEmits<{ (e: 'plantUsed', plant: Plant): void }>()
const hasPlants = computed(() => props.plants && props.plants.length > 0)

function handleUse(plant: Plant) {
  emit('plantUsed', plant)
}
</script>

<template>
  <div v-if="hasPlants" class="mt-6">
    <h2 class="text-2xl font-bold mb-4 text-center">Erkannte Pflanzen</h2>
    <div class="grid gap-4">
      <template
        v-for="(result, idx) in props.plants"
        :key="idx"
      >
        <div class="grid gap-4">
          <PlantInformationCard
            :use-use="true"
            v-for="(rec, index) in result.recognitions"
            :key="index"
            :recognition="rec"
            @use="handleUse"
          />
        </div>
      </template>
    </div>
  </div>
  <div v-else class="text-center text-muted-foreground mt-4">
    <EmtyState :title="t('plant.upload.NoScanDoneTitle')" :condition="true" :subtitle="t('plant.upload.NoScanDoneSubtitle')" img-src="/svg/undraw_going-up_g8av.svg" />
  </div>
</template>

<style scoped></style>
