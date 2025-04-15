<script lang="ts" setup>
import { Clock, CloudHail,Flower2, Droplet, Sun, Thermometer, Waves } from 'lucide-vue-next'
import { ilk, type Sensor, SensorStatusEnum } from '@/api'
import { Card, CardContent } from '@/components/ui/card'
import { useDeviceStore, usePlantStore } from '../stores'
import {ref,onMounted} from 'vue'
import { usePullToRefresh } from '@/composables/usePullToRefresh.ts'

const props = defineProps<{ sensor: Sensor }>()

const plant = ref("")

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

onMounted(async ()=>{
  plant.value = (await usePlantStore().getPlantDetails(props.sensor.plant)).name
})

usePullToRefresh(async () => {
  await useDeviceStore().fetchDevices(true);
});
</script>

<template>
  <Card class="w-full mt-2">
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
        <div class="flex items-center gap-2">
          <Flower2 class="w-5 h-5" />
          <p class="font-medium">
            {{plant}}
          </p>
        </div>
        <div v-if="sensor.values.length > 0" class="flex items-center gap-2 mt-1">
          <p class="font-medium">{{ sensor.values[sensor.values.length-1].value }} {{ sensor.unit }}</p>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
