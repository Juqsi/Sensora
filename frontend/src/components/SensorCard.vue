<script lang="ts" setup>
import { Clock, CloudHail, Droplet, Sun, Thermometer, Waves } from 'lucide-vue-next'
import { ilk, type Sensor, SensorStatusEnum } from '@/api'
import { Card, CardContent } from '@/components/ui/card'

const props = defineProps<{ sensor: Sensor }>()

const sensorStatusColorMap = {
  [SensorStatusEnum.Active]: 'border-primary',
  [SensorStatusEnum.Inactive]: 'border-muted-foreground',
  [SensorStatusEnum.Error]: 'border-destructive',
  [SensorStatusEnum.Unknown]: 'border-destructive',
}

const sensorDisplayMap = {
  [ilk.temperature]: Thermometer,
  [ilk.humidity]: CloudHail,
  [ilk.soilMoisture]: Droplet,
  [ilk.brightness]: Sun,
  [ilk.pump]: Waves,
}
</script>

<template>
  <Card class="w-full mt-2 max-w-md">
    <CardContent class="flex items-center p-3">
      <div :class="sensorStatusColorMap[sensor.status]" class="rounded-full p-2 border-4 mx-2">
        <component :is="sensorDisplayMap[sensor.ilk]" class="w-8 h-8" />
      </div>
      <div class="ml-2 w-full block">
        <h3 class="text-lg font-medium">Sensor ID: {{ sensor.sid.slice(0, 8) }}...</h3>
        <div class="flex items-center gap-2">
          <Clock class="w-5 h-5" />
          <p class="font-medium">
            {{ new Date(sensor.lastCall).toLocaleString() }}
          </p>
        </div>
        <div v-if="sensor.values.length > 0" class="flex items-center gap-2 mt-1">
          <p class="font-medium">{{ sensor.values[0].value }} {{ sensor.unit }}</p>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
