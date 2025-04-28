<script lang="ts" setup>
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Droplet, Sun, Thermometer,CloudHail } from 'lucide-vue-next'
import { ilk, type Plant, type Value } from '@/api'
import { latestSensorValue } from '@/composables/useLatestSensorValue.ts'
import { onMounted, type PropType, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {toLocalTime } from '@/composables/useTimeToLocal'

const { locale, t } = useI18n()
const plant = ref<Plant | undefined>()

const props = defineProps({ plant: { type: Object as PropType<Plant>, required: false } })

defineEmits(['updateActiveKey'])

const initializeWithPlant = (newPlant: Plant) => {
  plant.value = newPlant
  temperature.value = latestSensorValue([newPlant], ilk.temperature)
  soilMoisture.value = latestSensorValue([newPlant], ilk.soilMoisture)
  brightness.value = latestSensorValue([newPlant], ilk.brightness)
  humidity.value = latestSensorValue([newPlant], ilk.humidity)
}

onMounted(() => {
  if (props.plant !== undefined && plant.value === undefined) {
    initializeWithPlant(props.plant as Plant)
  }
})

const temperature = ref<Value | undefined>()
const soilMoisture = ref<Value | undefined>()
const brightness = ref<Value | undefined>()
const humidity = ref<Value | undefined>()

defineExpose({
  initializeWithPlant,
})

const formatTimestamp = (timestamp?: string | number) => {
  if (!timestamp) return '--'

  const date = toLocalTime(timestamp)
  const today = new Date()

  // Prüfen, ob das Datum heute ist
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()

  if (isToday) {
    // Nur die Uhrzeit anzeigen (HH:mm)
    return date.toLocaleTimeString(locale.value, { hour: '2-digit', minute: '2-digit' })
  } else {
    // Datum im Format DD.MM und Uhrzeit anzeigen
    return (
      date.toLocaleDateString(locale.value, { day: '2-digit', month: '2-digit' }) +
      ' ' +
      date.toLocaleTimeString(locale.value, { hour: '2-digit', minute: '2-digit' })
    )
  }
}

</script>

<template>
  <div class="grid gap-4 grid-cols-2 sm:grid-cols-4">
    <Card @click="$emit('updateActiveKey', ilk.temperature)">
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">{{t('temperature')}}</CardTitle>
        <Thermometer class="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold flex-row flex justify-between items-center">
          {{ temperature?.value ?? '--' }}
        </div>
        <p class="text-xs text-muted-foreground">{{ formatTimestamp(temperature?.timestamp) }}</p>
      </CardContent>
    </Card>
    <Card @click="$emit('updateActiveKey', ilk.soilMoisture)">
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-1">
        <CardTitle class="text-sm font-medium">{{t('soilMoisture')}}</CardTitle>
        <Droplet class="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold flex-row flex justify-between items-center">
          {{ soilMoisture?.value ?? '--' }}
        </div>
        <p class="text-xs text-muted-foreground">{{ formatTimestamp(soilMoisture?.timestamp) }}</p>
      </CardContent>
    </Card>
    <Card @click="$emit('updateActiveKey', ilk.humidity)">
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">{{t('humidity')}}</CardTitle>
        <CloudHail class="size-4" id="humidity" />
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold flex-row flex justify-between items-center">
          {{ humidity?.value ?? '--' }}
        </div>
        <p class="text-xs text-muted-foreground">{{ formatTimestamp(humidity?.timestamp) }}</p>
      </CardContent>
    </Card>
    <Card @click="$emit('updateActiveKey', ilk.brightness)">
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-1">
        <CardTitle class="text-sm font-medium">{{t('brightness')}}</CardTitle>
        <Sun class="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold flex-row flex justify-between items-center">
          {{ brightness?.value ?? '--' }}
        </div>
        <p class="text-xs text-muted-foreground">{{ formatTimestamp(brightness?.timestamp) }}</p>
      </CardContent>
    </Card>
  </div>
</template>
