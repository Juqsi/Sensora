<script lang="ts" setup>
import { computed } from 'vue'
import SensorCard from './SensorCard.vue'
import { ilk, type Sensor } from '@/api'

const props = defineProps<{ sensors: Sensor[] }>()

const groupedSensors = computed(() => {
  return props.sensors.reduce(
    (groups, sensor) => {
      if (!groups[sensor.ilk]) groups[sensor.ilk] = []
      groups[sensor.ilk].push(sensor)
      return groups
    },
    {} as Record<ilk, Sensor[]>,
  )
})

const sensorDisplayMap = {
  [ilk.temperature]: 'Temperature',
  [ilk.humidity]: 'Humidity',
  [ilk.soilMoisture]: 'Soil Moisture',
  [ilk.brightness]: 'Brightness',
  [ilk.pump]: 'Pump',
}
</script>

<template>
  <div v-for="(sensors, type) in groupedSensors" :key="type" class="w-full">
    <h2 class="text-xl font-semibold mt-6 mb-2">
      {{ sensorDisplayMap[type] ?? type }}
    </h2>
    <div class="grid xl:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-2 w-full">
      <SensorCard v-for="sensor in sensors" :key="sensor.sid" :sensor="sensor" />
    </div>
  </div>
</template>
