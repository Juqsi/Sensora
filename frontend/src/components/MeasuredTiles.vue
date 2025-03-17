<script lang="ts" setup>
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowDown, ArrowLeft, ArrowUp, Droplet, Sun, Thermometer } from 'lucide-vue-next'
import { ilk, type Plant, type Value } from '@/api'
import { latestSensorValue } from '@/composables/useLatestSensorValue.ts'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const plant = ref<Plant | undefined>()

defineEmits(['updateActiveKey'])

const initializeWithPlant = (newPlant: Plant) => {
  console.log('hier')
  console.log('plant', newPlant)
  plant.value = newPlant
  console.log('latestValues', latestSensorValue([newPlant], ilk.temperature))
  temperature.value = latestSensorValue([newPlant], ilk.temperature)
  soilMoisture.value = latestSensorValue([newPlant], ilk.soilMoisture)
  brightness.value = latestSensorValue([newPlant], ilk.brightness)
  humidity.value = latestSensorValue([newPlant], ilk.humidity)
}

const temperature = ref<Value | undefined>()
const soilMoisture = ref<Value | undefined>()
const brightness = ref<Value | undefined>()
const humidity = ref<Value | undefined>()

defineExpose({
  initializeWithPlant,
})

const formatTimestamp = (timestamp?: string | number) => {
  if (!timestamp) return '--'

  const date = new Date(timestamp)
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
        <CardTitle class="text-sm font-medium"> Temperature</CardTitle>
        <Thermometer class="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold flex-row flex justify-between items-center">
          {{ temperature?.value ?? '--' }} <ArrowUp class="w-4 h-4" />
        </div>
        <p class="text-xs text-muted-foreground">{{ formatTimestamp(temperature?.timestamp) }}</p>
      </CardContent>
    </Card>
    <Card @click="$emit('updateActiveKey', ilk.soilMoisture)">
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-1">
        <CardTitle class="text-sm font-medium"> Soil moisture</CardTitle>
        <Droplet class="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold flex-row flex justify-between items-center">
          {{ soilMoisture?.value ?? '--' }} <ArrowDown class="w-4 h-4" />
        </div>
        <p class="text-xs text-muted-foreground">{{ formatTimestamp(soilMoisture?.timestamp) }}</p>
      </CardContent>
    </Card>
    <Card @click="$emit('updateActiveKey', ilk.humidity)">
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">Humidity</CardTitle>
        <Sun class="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold flex-row flex justify-between items-center">
          {{ humidity?.value ?? '--' }} <ArrowLeft class="w-4 h-4" />
        </div>
        <p class="text-xs text-muted-foreground">{{ formatTimestamp(humidity?.timestamp) }}</p>
      </CardContent>
    </Card>
    <Card @click="$emit('updateActiveKey', ilk.brightness)">
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-1">
        <CardTitle class="text-sm font-medium">Brightness</CardTitle>
        <Sun class="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold flex-row flex justify-between items-center">
          {{ brightness?.value ?? '--' }} <ArrowLeft class="w-4 h-4" />
        </div>
        <p class="text-xs text-muted-foreground">{{ formatTimestamp(brightness?.timestamp) }}</p>
      </CardContent>
    </Card>
  </div>
</template>
